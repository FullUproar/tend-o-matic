import type { CustomerType } from "./customer";
import type { ProductCategory } from "./product";
import type { Weight } from "./weight";
import type { Ruleset } from "./ruleset";
import type { TaxRate } from "./tax";
import type { ServiceMode } from "./service-mode";

export type LineItem = {
  packageId: string;
  category: ProductCategory;
  weight: Weight;
  unitPriceCents: number;
  qty: number;
  // Product-eligibility flags captured at scan time. The cart refuses
  // line items that don't carry the affirmative flags; absence is a
  // refusal, never a permissive default.
  tested: boolean;
  labeled: boolean;
  recalled: boolean;
  // Adjusted-Δ9-THC percentage for the product. Required for any line
  // whose category falls under a THC-tiered tax rate (IL non-infused
  // tiers at 10% / 25%). Formula per IL CRTA: Δ9-THC% + 0.877 × THCA%.
  // Absent on a line that needs it → TAX_INPUT_MISSING refusal at
  // computeTaxes time.
  adjustedThcPct?: number;
};

export type Cart = {
  tenantId: string;
  locationId: string;
  customer: CustomerType;
  ruleset: Ruleset;
  lines: ReadonlyArray<LineItem>;
  // ISO timestamp the cart was opened. Used for day/month limit windows
  // and to pin which ruleset version applies.
  openedAt: string;
  // Whether the customer's ID was verified on this transaction. The
  // kernel refuses to apply a line item when this is false for an adult-
  // use sale; medical patient verification is tracked separately on
  // the customer-type variant.
  idVerified: boolean;
  // Local tax rates supplied by the tenant configuration. Round-2 sets
  // statutory caps (≤3% municipal + ≤3.75% county unincorp / 3% county
  // incorp for IL) but the specific rate per municipality is a per-
  // tenant value, not encoded in the ruleset. The kernel applies these
  // additively after ruleset rates.
  localTaxes?: ReadonlyArray<TaxRate>;
  // Budtender-set interaction mode for this transaction. Pure UI hint
  // — never gates a kernel check. Defaulted to DEFAULT_SERVICE_MODE
  // by openCart, so consumers can treat undefined as GUIDED. See
  // packages/compliance/src/service-mode.ts and docs/budtender-
  // rockstar-plan.md for the source of the four modes.
  serviceMode?: ServiceMode;
};
