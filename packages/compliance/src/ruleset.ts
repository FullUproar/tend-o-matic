import type { Jurisdiction } from "./jurisdiction";
import type { CustomerKind } from "./customer";
import type { Limit } from "./limit";
import type { EquivalencyTable } from "./equivalency";
import type { Provenance } from "./provenance";
import type { TaxBlock } from "./tax";
import type { ReceiptBlock } from "./receipt";
import type { ReturnPolicy } from "./returns";
import type { RecallPolicy } from "./recalls";

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
  // Tax block. Null until populated; kernel.computeTaxes refuses with
  // RULESET_INSUFFICIENT_VERIFICATION when null. Each rate carries its
  // own customer/category/THC restrictions.
  taxBlock: TaxBlock | null;
  // M1.4 blocks. Null = not yet populated (kernel/application refuses
  // operations that depend on the block). All three are static data
  // for the application to consume; no kernel math runs against them
  // directly in v0.1.
  receiptBlock: ReceiptBlock | null;
  returnsPolicy: ReturnPolicy | null;
  recallsPolicy: RecallPolicy | null;
  // Promo block deliberately omitted; round-2 MI/IL flagged BOGO/loyalty
  // as a counsel question.
};
