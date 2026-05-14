import type { Ruleset } from "../ruleset";

// Michigan fixture ruleset seeded from Manus 2026-05-13 research.
// Status: secondary-cite-only across the board. The kernel will refuse
// to load this ruleset in a production environment (which requires
// counsel-verified) and will refuse equivalency-dependent operations
// because the equivalency table is intentionally empty.
const SRC_MANUS_2026_05_13_R_420_104 = {
  provider: "manus",
  date: "2026-05-13",
  cite: "Mich Admin Code R. 420.104 (retailer obligations: 21+, tested, labeled)",
};
const SRC_MANUS_2026_05_13_R_420_506 = {
  provider: "manus",
  date: "2026-05-13",
  cite: "Mich Admin Code R. 420.506 (purchase limits)",
};

export const MI_2026_05_14: Ruleset = {
  jurisdiction: "MI",
  version: "mi-2026.05.14",
  effectiveFrom: "2026-05-14",
  effectiveTo: null,
  provenance: {
    status: "secondary-cite-only",
    sources: [SRC_MANUS_2026_05_13_R_420_104, SRC_MANUS_2026_05_13_R_420_506],
  },
  customerKinds: ["MI_ADULT_USE", "MI_MED_PATIENT", "MI_MED_CAREGIVER"],
  adultUseMinAge: {
    value: 21,
    provenance: {
      status: "secondary-cite-only",
      sources: [SRC_MANUS_2026_05_13_R_420_104],
    },
  },
  limitsByCustomerKind: {
    MI_ADULT_USE: [
      { dimension: "TOTAL_OUNCES", max: 2.5, window: "TRANSACTION" },
      { dimension: "CONCENTRATE_GRAMS", max: 15, window: "TRANSACTION" },
      { dimension: "IMMATURE_PLANTS", max: 3, window: "TRANSACTION" },
    ],
    MI_MED_PATIENT: [
      { dimension: "TOTAL_OUNCES", max: 2.5, window: "DAY" },
      { dimension: "TOTAL_OUNCES", max: 10, window: "MONTH" },
    ],
    MI_MED_CAREGIVER: [
      // 2.5 oz/day PER connected patient — the per-patient dimension is
      // not expressible without a more elaborate type; for v0.1 we flag
      // this as a known limitation in the dossier and refuse caregiver
      // limit checks until the ruleset shape extends.
    ],
  },
  limitsProvenance: {
    status: "secondary-cite-only",
    sources: [SRC_MANUS_2026_05_13_R_420_506],
  },
  // Equivalency table is intentionally empty: Manus did not extract
  // the rule for how non-flower categories roll up into the 2.5 oz
  // transaction cap. The kernel will refuse any line item whose
  // category lacks an equivalency entry, which is the correct
  // behavior until counsel populates this table.
  equivalencies: {},
  equivalenciesProvenance: {
    status: "todo",
    sources: [],
  },
};
