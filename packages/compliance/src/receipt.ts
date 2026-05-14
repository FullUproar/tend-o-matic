// Receipt content surface. v0.1 declares the shape; CRA/IDFPR-required
// field lists are entirely TODO in the dossier. The kernel refuses
// renderReceipt when the active ruleset has no receipt-spec block.
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
