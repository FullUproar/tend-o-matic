"use server";

import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import {
  makeKernel,
  openCart,
  reduce,
  computeTaxBreakdown,
  renderReceipt,
  formatReceiptAsText,
  MI_2026_05_14,
  type CustomerType,
  type LineItem,
  type RefusalReason,
  type Ruleset,
} from "@tend-o-matic/compliance";
import {
  withTenant,
  completeSale,
  type SaleWriterTx,
} from "@tend-o-matic/db";

const prisma = new PrismaClient();

// Map ruleset version → ruleset object. Phase 0 launches only the
// 2026-05-14 fixtures; future versions land as new rows in this map.
function rulesetFor(version: string): Ruleset {
  if (version === "mi-2026.05.14") return MI_2026_05_14;
  throw new Error(`Unknown ruleset version: ${version}`);
}

export type CompleteSaleInput = {
  tenantId: string;
  locationId: string;
  cashierUserId: string;
  customer: CustomerType;
  rulesetVersion: string;
  idVerified: boolean;
  lines: ReadonlyArray<LineItem>;
  tenderAmountCents: number; // total tendered (cash); single tender in M2.5c
};

export type CompleteSaleResponse =
  | {
      ok: true;
      saleId: string;
      receiptText: string;
      grandTotalCents: number;
      changeDueCents: number;
    }
  | {
      ok: false;
      reason: string;
      refusal?: RefusalReason;
    };

// Idempotency: ensure ONE demo Product + ONE demo Package exists per
// (tenant, category, weightUnit) so cart lines can reference them. Until
// M3 product catalog ships, training-mode sales share these bins.
async function ensureDemoPackage(
  tenantId: string,
  locationId: string,
  category: string,
  weightUnit: string,
): Promise<string> {
  const sku = `demo-${category.toLowerCase()}-${weightUnit.toLowerCase()}`;
  const metrcTag = `DEMO-${tenantId.slice(0, 8)}-${category}-${weightUnit}`;
  const existing = await prisma.package.findFirst({
    where: { tenantId, metrcTag },
    select: { id: true },
  });
  if (existing) return existing.id;
  const product = await prisma.product.upsert({
    where: { tenantId_sku: { tenantId, sku } },
    update: {},
    create: {
      tenantId,
      sku,
      name: `Demo ${category}`,
      category: category as never,
    },
  });
  const pkg = await prisma.package.create({
    data: {
      tenantId,
      locationId,
      productId: product.id,
      metrcTag,
      qty: 99999,
      qtyUnit: weightUnit,
      tested: true,
      labeled: true,
      recalled: false,
    },
  });
  return pkg.id;
}

export async function completeSaleAction(
  input: CompleteSaleInput,
): Promise<CompleteSaleResponse> {
  // 1. Server-side re-validation: rebuild the cart from scratch and run
  // every line through the kernel. Client can't be trusted to have
  // honored the refusal codes.
  const ruleset = rulesetFor(input.rulesetVersion);
  const kernel = makeKernel({ requireRulesetStatus: "secondary-cite-only" });

  let cart = openCart({
    tenantId: input.tenantId,
    locationId: input.locationId,
    customer: input.customer,
    ruleset,
    idVerified: input.idVerified,
  });

  for (const line of input.lines) {
    const r = reduce(cart, { type: "ADD_LINE", line }, kernel);
    if (!r.ok) {
      return {
        ok: false,
        reason: "Kernel refused a line item during server-side revalidation.",
        refusal: r.reason,
      };
    }
    cart = r.cart;
  }

  // 2. Compute taxes server-side.
  const taxResult = computeTaxBreakdown(cart);
  if (!taxResult.ok) {
    return {
      ok: false,
      reason: "Tax computation refused on the server.",
      refusal: taxResult.reason,
    };
  }
  const tax = taxResult.breakdown;

  // 3. Tender sum must cover total. Cash supports over-tender (change).
  if (input.tenderAmountCents < tax.grandTotalCents) {
    return {
      ok: false,
      reason: `Tender ${input.tenderAmountCents} cents short of total ${tax.grandTotalCents} cents.`,
    };
  }
  const changeDueCents = input.tenderAmountCents - tax.grandTotalCents;

  // 4. Ensure demo Product + Package rows exist for each line's category.
  // These are auto-minted bins for training mode; M3 product catalog
  // replaces this with real catalog reads.
  const packageIdByCategory = new Map<string, string>();
  for (const line of cart.lines) {
    const key = `${line.category}|${line.weight.unit}`;
    if (!packageIdByCategory.has(key)) {
      const pkgId = await ensureDemoPackage(
        input.tenantId,
        input.locationId,
        line.category,
        line.weight.unit,
      );
      packageIdByCategory.set(key, pkgId);
    }
  }

  // 5. Atomic sale write: withTenant pins the GUC, completeSale issues
  // the 5 INSERTs (sale, sale_item × N, payment, audit_log, metrc_outbox).
  const saleId = randomUUID();
  await withTenant(prisma, input.tenantId, async (tx) => {
    await completeSale(tx as SaleWriterTx, {
      tenantId: input.tenantId,
      locationId: input.locationId,
      cashierUserId: input.cashierUserId,
      customerId: null, // M2.5c doesn't persist customer rows yet
      customerKindAtSale: input.customer.kind,
      rulesetVersion: input.rulesetVersion,
      subtotalCents: tax.subtotalCents,
      taxCents: tax.totalTaxCents,
      totalCents: tax.grandTotalCents,
      lines: cart.lines.map((line) => ({
        packageId: packageIdByCategory.get(
          `${line.category}|${line.weight.unit}`,
        )!,
        category: line.category,
        qty: line.qty,
        weightValue: line.weight.value,
        weightUnit: line.weight.unit,
        unitPriceCents: line.unitPriceCents,
        lineTotalCents: line.unitPriceCents * line.qty,
      })),
      tenders: [
        { tenderType: "CASH", amountCents: tax.grandTotalCents }, // exact, not over-tender
      ],
      saleId,
    });
  });

  // 6. Render receipt for the till to display.
  const renderResult = renderReceipt(cart, tax, {
    store: {
      name: "Demo MI Dispensary",
      address: ["123 Main St", "Ann Arbor, MI 48104"],
      licenseNumber: "AU-R-000123",
    },
    sale: {
      id: saleId,
      receiptId: saleId.slice(0, 8).toUpperCase(),
      completedAt: new Date().toISOString(),
      cashierName: "Sample Cashier",
      cashierUserId: input.cashierUserId,
    },
    tenders: [{ tenderType: "CASH", amountCents: tax.grandTotalCents }],
    changeDueCents,
  });
  if (!renderResult.ok) {
    return {
      ok: false,
      reason: "Sale recorded but receipt render refused.",
      refusal: renderResult.reason,
    };
  }
  const receiptText = formatReceiptAsText(renderResult.receipt);

  return {
    ok: true,
    saleId,
    receiptText,
    grandTotalCents: tax.grandTotalCents,
    changeDueCents,
  };
}
