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
    }
  | {
      // Limit math for windows other than TRANSACTION (DAY, MONTH,
      // FOURTEEN_DAYS) requires prior-usage history that the kernel does
      // not yet accept. Until a PR adds the PriorUsage input, the kernel
      // refuses any cart whose applicable limits include a non-
      // TRANSACTION window.
      code: "LIMIT_WINDOW_NOT_IMPLEMENTED";
      dimension: LimitDimension;
      window: LimitWindow;
    }
  | {
      // A LineItem's weight unit doesn't match what the kernel needs to
      // route the contribution into the relevant LimitDimension. Example:
      // an INFUSED line item under the IL ruleset is tracked under
      // INFUSED_MG_THC and therefore requires a MG_THC weight; supplying
      // grams there is a refusal. The application surfaces this as
      // "product weight unit doesn't match jurisdiction's tracking
      // dimension".
      code: "WEIGHT_UNIT_INCOMPATIBLE";
      packageId: string;
      providedUnit: string;
      expectedUnit: string;
    }
  | {
      // A line item is missing data the tax engine needs to compute its
      // tier. Currently used for IL non-infused tax tiers (10% / 25%)
      // which require `adjustedThcPct` on the line.
      code: "TAX_INPUT_MISSING";
      packageId: string;
      missingField: string;
    };

export type RefusalCode = RefusalReason["code"];
