import type { LimitDimension, LimitWindow } from "./limit";
import type { ProductCategory } from "./product";
import type { VerificationStatus } from "./provenance";

// Every refusal carries a machine-readable code plus enough context to
// render a budtender-facing explanation. Budtender expert-mode UI
// translates these into plain English ("this would push the transaction
// 0.3 oz over the daily limit"); the kernel never produces the prose.
export type RefusalReason =
  | { code: "AGE_BELOW_MINIMUM"; min: number; actual: number | null }
  | { code: "ID_NOT_VERIFIED" }
  | { code: "PRODUCT_NOT_TESTED"; packageId: string }
  | { code: "PRODUCT_NOT_LABELED"; packageId: string }
  | { code: "PRODUCT_RECALLED"; packageId: string }
  | {
      code: "LIMIT_EXCEEDED";
      dimension: LimitDimension;
      window: LimitWindow;
      would: number;
      max: number;
    }
  | { code: "MEDICAL_PATIENT_NOT_VERIFIED" }
  | { code: "MEDICAL_CAREGIVER_NOT_LINKED" }
  | { code: "EQUIVALENCY_UNDEFINED"; category: ProductCategory }
  | {
      code: "RULESET_INSUFFICIENT_VERIFICATION";
      required: VerificationStatus;
      actual: VerificationStatus;
    }
  | {
      code: "JURISDICTION_MISMATCH";
      customerJurisdiction: string;
      rulesetJurisdiction: string;
    };

export type RefusalCode = RefusalReason["code"];
