"use server";

import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { requirePermission } from "@tend-o-matic/auth-runtime";
import { auth, signOut } from "../lib/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in" });
}
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

// CompleteSaleInput intentionally omits tenantId/locationId/cashierUserId
// — those come from the session inside the action. Trusting the client to
// supply them would defeat tenant isolation.
export type CompleteSaleInput = {
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

export async function completeSaleAction(
  input: CompleteSaleInput,
): Promise<CompleteSaleResponse> {
  // 0. Session-driven identity + permission check. Client never gets to
  // spoof tenantId or cashierUserId; both come from the signed-in user,
  // and the till.sale.start permission gates the action server-side.
  const session = await auth();
  try {
    requirePermission(session, "till.sale.start");
  } catch (e) {
    return {
      ok: false,
      reason:
        e instanceof Error
          ? e.message
          : "Permission denied to start a till sale.",
    };
  }
  const tenantId = session.user.tenantId;
  const cashierUserId = session.user.id;
  const locationId = session.user.locationId;
  if (!locationId) {
    return { ok: false, reason: "Session has no location assigned." };
  }

  // 1. Server-side re-validation: rebuild the cart from scratch and run
  // every line through the kernel. Client can't be trusted to have
  // honored the refusal codes.
  const ruleset = rulesetFor(input.rulesetVersion);
  const kernel = makeKernel({ requireRulesetStatus: "secondary-cite-only" });

  let cart = openCart({
    tenantId,
    locationId,
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

  // 4. Resolve each cart line's productId (the till's ProductPicker
  // uses Product.id as packageId) into a real Package row. M3.4 reads
  // the seed-created Packages directly; M3.2 inventory work will pick
  // by FIFO + lot-status instead of the first available.
  const packageIdByProduct = new Map<string, string>();
  for (const line of cart.lines) {
    if (packageIdByProduct.has(line.packageId)) continue;
    const pkg = await prisma.package.findFirst({
      where: {
        tenantId,
        productId: line.packageId,
        status: "AVAILABLE",
      },
      select: { id: true },
      orderBy: { createdAt: "asc" }, // FIFO until M3.2 ships
    });
    if (!pkg) {
      return {
        ok: false,
        reason: `No available package for product ${line.packageId}. Add stock in the backoffice.`,
      };
    }
    packageIdByProduct.set(line.packageId, pkg.id);
  }

  // 5. Atomic sale write: withTenant pins the GUC, completeSale issues
  // the 5 INSERTs (sale, sale_item × N, payment, audit_log, metrc_outbox).
  const saleId = randomUUID();
  await withTenant(prisma, tenantId, async (tx) => {
    await completeSale(tx as SaleWriterTx, {
      tenantId,
      locationId,
      cashierUserId,
      customerId: null, // M2.5c doesn't persist customer rows yet
      customerKindAtSale: input.customer.kind,
      rulesetVersion: input.rulesetVersion,
      subtotalCents: tax.subtotalCents,
      taxCents: tax.totalTaxCents,
      totalCents: tax.grandTotalCents,
      lines: cart.lines.map((line) => ({
        packageId: packageIdByProduct.get(line.packageId)!,
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

  // 6. Render receipt for the till to display. Store/location info
  // pulled from the tenant + location rows so the receipt always matches
  // the signed-in session's actual tenant.
  const [tenantRow, locationRow] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, licenseNo: true },
    }),
    prisma.location.findUnique({
      where: { id: locationId },
      select: {
        name: true,
        licenseNo: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
      },
    }),
  ]);
  const userRow = await prisma.user.findUnique({
    where: { id: cashierUserId },
    select: { name: true, email: true },
  });
  const addressLines = [
    locationRow?.addressLine1,
    locationRow?.addressLine2,
    [locationRow?.city, locationRow?.state, locationRow?.postalCode]
      .filter(Boolean)
      .join(", "),
  ].filter((s): s is string => Boolean(s));

  const renderResult = renderReceipt(cart, tax, {
    store: {
      name: tenantRow?.name ?? "Unknown tenant",
      address: addressLines.length > 0 ? addressLines : ["(no address)"],
      licenseNumber: locationRow?.licenseNo ?? tenantRow?.licenseNo ?? "(none)",
    },
    sale: {
      id: saleId,
      receiptId: saleId.slice(0, 8).toUpperCase(),
      completedAt: new Date().toISOString(),
      cashierName: userRow?.name ?? userRow?.email ?? "Cashier",
      cashierUserId,
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
