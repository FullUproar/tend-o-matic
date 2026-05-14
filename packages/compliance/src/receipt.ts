import type { Provenance } from "./provenance";

// ReceiptField enumerates every field a jurisdiction can require on a
// printed/digital receipt. The fixture for each ruleset declares which
// fields are required + their provenance; the application's receipt
// renderer fails to ship a sale if a required field is missing.
export const RECEIPT_FIELDS = [
  "STORE_NAME",
  "STORE_ADDRESS",
  "LICENSE_NUMBER",
  "DATETIME",
  "RECEIPT_ID",
  "STAFF_ID",
  "ITEM_DESCRIPTION",
  "ITEM_QTY",
  "ITEM_UNIT_PRICE",
  "ITEM_LINE_TOTAL",
  "ITEM_TAX_BREAKDOWN_PER_LINE",
  "SUBTOTAL",
  "TAX_TOTAL_PER_RATE",
  "TAX_TOTAL_AGGREGATE",
  "GRAND_TOTAL",
  "TENDER_TYPE",
  "TENDER_AMOUNT",
  "CHANGE_DUE",
  "CUSTOMER_AGE_VERIFIED",
  "MEDICAL_REGISTRY_HASH",
  "BARCODE",
  "RETURN_POLICY_TEXT",
] as const;
export type ReceiptField = (typeof RECEIPT_FIELDS)[number];

export type ReceiptFieldRequirement = {
  field: ReceiptField;
  // Whether the field MUST appear on a compliant receipt. Fields not in
  // a ruleset's requirements are permitted but not required.
  required: boolean;
  // Optional free-text rule note (e.g., "bundled items must be separately
  // identified by qty/price" for IL B5).
  note?: string;
};

export type ReceiptBlock = {
  requirements: ReadonlyArray<ReceiptFieldRequirement>;
  // Free-text notes that apply to the entire receipt (e.g., "no PII
  // beyond age ID" for MI A8 / MCL 333.27958).
  notes: ReadonlyArray<string>;
  provenance: Provenance;
};

// ReceiptLine + ReceiptContent are the rendered-output types that
// renderReceipt produces; ReceiptBlock above is the SPEC the renderer
// must satisfy.
export type ReceiptLine = {
  description: string;
  qty: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

export type ReceiptContent = {
  rulesetVersion: string;
  header: ReadonlyArray<string>;
  customerBlock: ReadonlyArray<string>;
  lines: ReadonlyArray<ReceiptLine>;
  taxLines: ReadonlyArray<{ label: string; amountCents: number }>;
  totals: { subtotalCents: number; taxCents: number; totalCents: number };
  footer: ReadonlyArray<string>;
};
