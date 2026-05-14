import type { Jurisdiction } from "./jurisdiction";
import type { CustomerKind } from "./customer";
import type { Limit } from "./limit";
import type { EquivalencyTable } from "./equivalency";
import type { Provenance } from "./provenance";

// A Ruleset is the dated, immutable encoding of the rules in force for
// one jurisdiction at one point in time. Old rulesets are forever: a sale
// from 2026-03-14 is evaluated against the ruleset effective on
// 2026-03-14, even after a newer ruleset publishes.
export type Ruleset = {
  jurisdiction: Jurisdiction;
  version: string; // e.g. "mi-2026.05.14"
  effectiveFrom: string; // ISO date
  effectiveTo: string | null;
  // Overall ruleset provenance reflects the WEAKEST status of any rule
  // inside it. The kernel uses this to decide whether to load it.
  provenance: Provenance;
  customerKinds: ReadonlyArray<CustomerKind>;
  adultUseMinAge: {
    value: number;
    provenance: Provenance;
  };
  limitsByCustomerKind: Partial<Record<CustomerKind, ReadonlyArray<Limit>>>;
  limitsProvenance: Provenance;
  equivalencies: EquivalencyTable;
  equivalenciesProvenance: Provenance;
  // Tax, receipt, promo intentionally omitted from v0.1 — their rule
  // values are entirely TODO in the dossier. Adding them later is a
  // non-breaking extension because the kernel refuses to compute taxes
  // or render receipts when the corresponding ruleset field is missing.
};
