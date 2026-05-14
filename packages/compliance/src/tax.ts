import type { CustomerKind } from "./customer";
import type { ProductCategory } from "./product";
import type { Provenance } from "./provenance";

export type TaxCode = "STATE_EXCISE" | "STATE_SALES" | "LOCAL" | "OTHER";

// Base for a tax-rate calculation:
//   LINE_PRICE     — applied to each matching line independently
//                    (line price × qty), then summed. Used for IL excise
//                    where tier depends on per-line category + THC%.
//   SUBTOTAL       — applied once to (sum of all matching line totals).
//   SUBTOTAL_PLUS_PRIOR_STATE_TAX — applied to subtotal plus the sum of
//                    STATE_EXCISE amounts already computed. Used for MI
//                    sales tax (which stacks on MRE).
export type TaxBase =
  | "LINE_PRICE"
  | "SUBTOTAL"
  | "SUBTOTAL_PLUS_PRIOR_STATE_TAX";

// THC-tier conditional: only applies when the line's adjusted THC %
// satisfies the comparator. Used for IL's 10% (≤35%) vs 25% (>35%) split.
export type ThcCondition = {
  op: "lte" | "gt";
  pct: number;
};

export type TaxRate = {
  code: TaxCode;
  label: string;
  rate: number; // decimal, e.g. 0.10 for 10%
  base: TaxBase;
  // When set, this rate only applies if the line's category is in the
  // list. (LINE_PRICE base only — for SUBTOTAL bases the rate applies
  // to the whole subtotal regardless.)
  onlyForCategories?: ReadonlyArray<ProductCategory>;
  // When set, this rate only applies if the line's adjusted-THC %
  // satisfies the comparator. The line must carry `adjustedThcPct`;
  // absence is a TAX_INPUT_MISSING refusal.
  thcCondition?: ThcCondition;
  // Customer-kind restrictions. If onlyCustomerKinds is set, the rate
  // applies only to those kinds; if excludeCustomerKinds is set, the
  // rate applies to all kinds except those.
  onlyCustomerKinds?: ReadonlyArray<CustomerKind>;
  excludeCustomerKinds?: ReadonlyArray<CustomerKind>;
};

// Rounding policy for the tax engine. PER_LINE rounds each line's tax
// to the nearest cent before summing (cash-register style); PER_SUBTOTAL
// computes against unrounded line totals and rounds the final sum. Per
// dossier counsel-Q, MI rounding is currently TODO.
export type TaxRounding = "PER_LINE" | "PER_SUBTOTAL" | "TODO";

export type TaxBlock = {
  rates: ReadonlyArray<TaxRate>;
  rounding: TaxRounding;
  provenance: Provenance;
};

export type TaxLine = {
  code: TaxCode;
  label: string;
  amountCents: number;
};

export type TaxBreakdown = {
  rulesetVersion: string;
  subtotalCents: number;
  lines: ReadonlyArray<TaxLine>;
  totalTaxCents: number;
  grandTotalCents: number; // subtotal + totalTax
};
