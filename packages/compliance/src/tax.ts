// Tax engine surface. v0.1 declares the shape; no MI/IL tax values are
// populated yet (entirely TODO in the dossier). The kernel refuses
// computeTaxes when the active ruleset has no tax block.
export type TaxLine = {
  code: "STATE_EXCISE" | "STATE_SALES" | "LOCAL" | "OTHER";
  label: string;
  amountCents: number;
};

export type TaxBreakdown = {
  rulesetVersion: string;
  lines: ReadonlyArray<TaxLine>;
  totalCents: number;
};
