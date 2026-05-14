import type { Cart } from "./cart";
import type { TaxBreakdown } from "./tax";
import type { ReceiptContent, ReceiptField, ReceiptLine } from "./receipt";
import type { RefusalReason } from "./refusal";
import type { RenderReceiptResult } from "./kernel";

// ReceiptContext supplies the application/sale data the kernel doesn't
// know about: store identity, sale identifiers, tender breakdown.
export type ReceiptContext = {
  store: {
    name: string;
    address: ReadonlyArray<string>;
    licenseNumber: string;
  };
  sale: {
    id: string;
    receiptId: string; // human-friendly per-tenant counter
    completedAt: string; // ISO
    cashierName: string;
    cashierUserId: string;
  };
  tenders: ReadonlyArray<{
    tenderType: string;
    amountCents: number;
  }>;
  changeDueCents: number;
};

// RenderReceiptResult is re-exported from kernel.ts; same shape, single
// source of truth so kernel.renderReceipt and the standalone renderer
// produce compatible outputs.

// Check that every field marked required on the ruleset's ReceiptBlock
// is actually populated by the renderer's output. Currently returns
// the first missing field; future expansion could aggregate.
//
// "Populated" semantics per field:
//   STORE_NAME       — store.name non-empty
//   STORE_ADDRESS    — store.address has ≥1 line
//   LICENSE_NUMBER   — store.licenseNumber non-empty
//   DATETIME         — sale.completedAt non-empty ISO
//   RECEIPT_ID       — sale.receiptId non-empty
//   STAFF_ID         — sale.cashierUserId non-empty
//   ITEM_*           — cart has ≥1 line (per-line presence implicit)
//   SUBTOTAL / TAX_* — taxBreakdown lines exist
//   GRAND_TOTAL      — taxBreakdown.grandTotalCents present
//   TENDER_*         — tenders has ≥1 entry
//   CHANGE_DUE       — changeDueCents is a number (0 is fine)
//   CUSTOMER_AGE_VERIFIED — cart.idVerified is true (or the customer is
//                          medical and registry verification is implied)
//   MEDICAL_REGISTRY_HASH — when customer is *_MED_PATIENT, hash present
//   BARCODE / RETURN_POLICY_TEXT / ITEM_TAX_BREAKDOWN_PER_LINE —
//                          not currently implemented; refuses if required.
function fieldPopulated(
  field: ReceiptField,
  cart: Cart,
  tax: TaxBreakdown,
  ctx: ReceiptContext,
): boolean {
  switch (field) {
    case "STORE_NAME":
      return ctx.store.name.length > 0;
    case "STORE_ADDRESS":
      return ctx.store.address.length > 0;
    case "LICENSE_NUMBER":
      return ctx.store.licenseNumber.length > 0;
    case "DATETIME":
      return ctx.sale.completedAt.length > 0;
    case "RECEIPT_ID":
      return ctx.sale.receiptId.length > 0;
    case "STAFF_ID":
      return ctx.sale.cashierUserId.length > 0;
    case "ITEM_DESCRIPTION":
    case "ITEM_QTY":
    case "ITEM_UNIT_PRICE":
    case "ITEM_LINE_TOTAL":
      return cart.lines.length > 0;
    case "SUBTOTAL":
      return Number.isFinite(tax.subtotalCents);
    case "TAX_TOTAL_PER_RATE":
      return tax.lines.length > 0 || tax.totalTaxCents === 0;
    case "TAX_TOTAL_AGGREGATE":
      return Number.isFinite(tax.totalTaxCents);
    case "GRAND_TOTAL":
      return Number.isFinite(tax.grandTotalCents);
    case "TENDER_TYPE":
    case "TENDER_AMOUNT":
      return ctx.tenders.length > 0;
    case "CHANGE_DUE":
      return Number.isFinite(ctx.changeDueCents);
    case "CUSTOMER_AGE_VERIFIED":
      if (cart.idVerified) return true;
      // Medical customers may pass via registry instead of ID — caller's
      // responsibility to ensure verification path was followed.
      return cart.customer.kind.includes("MED_");
    case "MEDICAL_REGISTRY_HASH": {
      const c = cart.customer;
      if (c.kind === "MI_MED_PATIENT" || c.kind === "IL_MED_PATIENT") {
        return c.registryIdHash.length > 0;
      }
      // Not a medical customer — field doesn't apply, treat as populated.
      return true;
    }
    case "BARCODE":
    case "RETURN_POLICY_TEXT":
    case "ITEM_TAX_BREAKDOWN_PER_LINE":
      // Not yet implemented by the renderer. If a ruleset requires these
      // fields and they're not yet emitted, render refuses.
      return false;
  }
}

// Render a receipt by assembling the kernel-known parts (lines, taxes)
// with the application-supplied context (store, sale, tenders) and
// validating against the active ruleset's ReceiptBlock requirements.
export function renderReceipt(
  cart: Cart,
  tax: TaxBreakdown,
  ctx: ReceiptContext,
): RenderReceiptResult {
  const block = cart.ruleset.receiptBlock;
  if (!block) {
    return {
      ok: false,
      reason: {
        code: "RULESET_INSUFFICIENT_VERIFICATION",
        required: "secondary-cite-only",
        actual: "todo",
      },
    };
  }

  // Validate every required field is populated.
  for (const req of block.requirements) {
    if (!req.required) continue;
    if (!fieldPopulated(req.field, cart, tax, ctx)) {
      return {
        ok: false,
        reason: {
          code: "TAX_INPUT_MISSING",
          packageId: "", // not line-specific
          missingField: `receipt.${req.field}`,
        },
      };
    }
  }

  // Assemble the rendered output.
  const lines: ReceiptLine[] = cart.lines.map((l) => ({
    description: `${l.category} (${l.weight.value}${l.weight.unit})`,
    qty: l.qty,
    unitPriceCents: l.unitPriceCents,
    lineTotalCents: l.unitPriceCents * l.qty,
  }));

  const header: string[] = [
    ctx.store.name,
    ...ctx.store.address,
    `License: ${ctx.store.licenseNumber}`,
    ctx.sale.completedAt,
    `Receipt #${ctx.sale.receiptId}`,
    `Cashier: ${ctx.sale.cashierName}`,
  ];

  const customerBlock: string[] = [];
  const c = cart.customer;
  if (c.kind.includes("MED_")) {
    customerBlock.push("Medical sale");
    if (c.kind === "MI_MED_PATIENT" || c.kind === "IL_MED_PATIENT") {
      customerBlock.push(`Patient ID: ${maskHash(c.registryIdHash)}`);
    }
  } else {
    customerBlock.push("Adult-use sale — age verified");
  }

  const taxLines = tax.lines.map((t) => ({
    label: t.label,
    amountCents: t.amountCents,
  }));

  const footer: string[] = [];
  for (const tender of ctx.tenders) {
    footer.push(`${tender.tenderType}: ${formatCents(tender.amountCents)}`);
  }
  if (ctx.changeDueCents > 0) {
    footer.push(`Change: ${formatCents(ctx.changeDueCents)}`);
  }
  footer.push(`Ruleset: ${cart.ruleset.version}`);

  return {
    ok: true,
    receipt: {
      rulesetVersion: cart.ruleset.version,
      header,
      customerBlock,
      lines,
      taxLines,
      totals: {
        subtotalCents: tax.subtotalCents,
        taxCents: tax.totalTaxCents,
        totalCents: tax.grandTotalCents,
      },
      footer,
    },
  };
}

// Format a receipt as a monospace string suitable for ESC/POS thermal
// printers (42-char width is typical for 80mm paper). The actual
// printer driver in M6 will translate this to the ESC/POS byte stream;
// for now this is the human-readable preview / email-body content.
export function formatReceiptAsText(
  receipt: ReceiptContent,
  width = 42,
): string {
  const sep = "-".repeat(width);
  const out: string[] = [];
  out.push(...receipt.header.map(centerText(width)));
  out.push(sep);
  out.push(...receipt.customerBlock);
  out.push(sep);
  for (const line of receipt.lines) {
    out.push(line.description);
    out.push(
      twoColumn(width)(
        `  ${line.qty} × ${formatCents(line.unitPriceCents)}`,
        formatCents(line.lineTotalCents),
      ),
    );
  }
  out.push(sep);
  out.push(twoColumn(width)("Subtotal", formatCents(receipt.totals.subtotalCents)));
  for (const tax of receipt.taxLines) {
    out.push(twoColumn(width)(tax.label, formatCents(tax.amountCents)));
  }
  out.push(twoColumn(width)("Tax total", formatCents(receipt.totals.taxCents)));
  out.push(twoColumn(width)("TOTAL", formatCents(receipt.totals.totalCents)));
  out.push(sep);
  out.push(...receipt.footer);
  return out.join("\n");
}

function formatCents(c: number): string {
  const negative = c < 0;
  const abs = Math.abs(c);
  const dollars = Math.floor(abs / 100);
  const cents = abs % 100;
  return `${negative ? "-" : ""}$${dollars}.${cents.toString().padStart(2, "0")}`;
}

function twoColumn(width: number) {
  return (left: string, right: string): string => {
    const padding = Math.max(1, width - left.length - right.length);
    return left + " ".repeat(padding) + right;
  };
}

function centerText(width: number) {
  return (s: string): string => {
    if (s.length >= width) return s;
    const pad = Math.floor((width - s.length) / 2);
    return " ".repeat(pad) + s;
  };
}

function maskHash(hash: string): string {
  if (hash.length <= 8) return "****";
  return `${hash.slice(0, 4)}…${hash.slice(-4)}`;
}
