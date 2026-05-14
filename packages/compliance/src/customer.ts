import type { Jurisdiction } from "./jurisdiction";

// Customer-type variants encode the jurisdiction at the type level so the
// kernel can't accidentally evaluate an IL_ADULT_USE_NONRESIDENT under a
// Michigan ruleset. PHI-bearing fields are always *hashed* identifiers,
// never raw registry numbers.
export type CustomerType =
  // Michigan
  | { kind: "MI_ADULT_USE" }
  | { kind: "MI_MED_PATIENT"; registryIdHash: string }
  | {
      kind: "MI_MED_CAREGIVER";
      caregiverIdHash: string;
      servingPatientIdHash: string;
    }
  // Illinois
  | { kind: "IL_ADULT_USE_RESIDENT" }
  | { kind: "IL_ADULT_USE_NONRESIDENT" }
  | { kind: "IL_MED_PATIENT"; registryIdHash: string };

export type CustomerKind = CustomerType["kind"];

export function customerJurisdiction(c: CustomerType): Jurisdiction {
  return c.kind.startsWith("MI_") ? "MI" : "IL";
}

export function isMedical(c: CustomerType): boolean {
  return c.kind.includes("MED_");
}
