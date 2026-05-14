import type { Ruleset } from "../ruleset";

// Illinois fixture ruleset seeded from Manus 2026-05-13 research.
// Same status caveat as the Michigan fixture. Note that Manus extracted
// *possession* limits; whether per-transaction limits are identical to
// possession limits is an open dossier item, so the limits here are
// labeled "secondary-cite-only" but tagged as possession-limit-derived
// in the source citation.
const SRC_MANUS_IL_FAQ = {
  provider: "manus",
  date: "2026-05-13",
  cite: "CROO adult-use FAQ + CRTA (possession limits; transaction vs possession reconciliation TODO)",
};

export const IL_2026_05_14: Ruleset = {
  jurisdiction: "IL",
  version: "il-2026.05.14",
  effectiveFrom: "2026-05-14",
  effectiveTo: null,
  provenance: {
    status: "secondary-cite-only",
    sources: [SRC_MANUS_IL_FAQ],
  },
  customerKinds: [
    "IL_ADULT_USE_RESIDENT",
    "IL_ADULT_USE_NONRESIDENT",
    "IL_MED_PATIENT",
  ],
  adultUseMinAge: {
    value: 21,
    provenance: { status: "secondary-cite-only", sources: [SRC_MANUS_IL_FAQ] },
  },
  limitsByCustomerKind: {
    IL_ADULT_USE_RESIDENT: [
      { dimension: "FLOWER_GRAMS", max: 30, window: "TRANSACTION" },
      { dimension: "INFUSED_MG_THC", max: 500, window: "TRANSACTION" },
      { dimension: "CONCENTRATE_GRAMS", max: 5, window: "TRANSACTION" },
    ],
    IL_ADULT_USE_NONRESIDENT: [
      { dimension: "FLOWER_GRAMS", max: 15, window: "TRANSACTION" },
      { dimension: "INFUSED_MG_THC", max: 250, window: "TRANSACTION" },
      { dimension: "CONCENTRATE_GRAMS", max: 2.5, window: "TRANSACTION" },
    ],
    IL_MED_PATIENT: [
      // Medical allotment is dynamically looked up in Metrc rather
      // than statically capped; this array is intentionally empty in
      // the fixture, and the dossier flags that medical limits will
      // require an integration-time check, not a ruleset check.
    ],
  },
  limitsProvenance: {
    status: "secondary-cite-only",
    sources: [SRC_MANUS_IL_FAQ],
  },
  equivalencies: {},
  equivalenciesProvenance: { status: "todo", sources: [] },
};
