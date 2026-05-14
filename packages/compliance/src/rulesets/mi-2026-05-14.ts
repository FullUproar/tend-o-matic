import type { Ruleset } from "../ruleset";

// Michigan fixture ruleset.
// Status: `secondary-cite-only`. The kernel refuses to load this ruleset
// in production (which requires `counsel-verified`).
//
// Round-2 (manus-2026-05-13) closed the equivalency, caregiver, and ID/PII
// gaps that round-1 left as TODOs. The interpretive call below — that the
// MCL 333.26424 equivalencies (a MEDICAL marihuana act provision) govern
// MRTMA ADULT-USE transactions — is the single largest counsel question
// gating production cutover.
//
// Counsel review questions for this fixture:
//   Q1 (A1): Do the MCL 333.26424 equivalency ratios govern MRTMA adult-use
//       transactions? Manus found NO direct CRA/MRTMA cite confirming this.
//       Until counsel signs, kernel runs these values only in dev/test/training.
//   Q2 (A1): Does "marihuana concentrate" (the 15g sub-cap) roll up into the
//       2.5oz total at factor 1, or at a different ratio? Statute is silent;
//       conservative 1:1 encoded below.
//   Q3 (A3): What is the day/month boundary semantics for medical limits?
//       Calendar day vs 24-hour rolling? Manus could not resolve. Encoded as
//       calendar-DAY here for now; flag for review.
//   Q4 (A1): INFUSED, TOPICAL categories are intentionally NOT mapped because
//       the equivalency depends on FORM (solid 1:16 / gaseous 1:7 by mass /
//       liquid 1:36 by fluid volume). Until ProductCategory is split or
//       LineItem carries a `form` field, kernel refuses with EQUIVALENCY_UNDEFINED.

const SRC_R_420_104 = {
  provider: "manus",
  date: "2026-05-13",
  cite: "Mich Admin Code R. 420.104 (retailer obligations: 21+, tested, labeled)",
};
const SRC_R_420_506 = {
  provider: "manus",
  date: "2026-05-13",
  cite: "Mich Admin Code R. 420.506 (purchase limits; transactions; marihuana sales location, eff. 2022-03-07)",
};
const SRC_MCL_333_26424 = {
  provider: "manus",
  date: "2026-05-13",
  cite: "MCL 333.26424 (Michigan Medical Marihuana Act §4 — caregiver per-patient limits and equivalency ratios, eff. 2016-12-20)",
  url: "https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-333-26424",
};

export const MI_2026_05_14: Ruleset = {
  jurisdiction: "MI",
  version: "mi-2026.05.14",
  effectiveFrom: "2026-05-14",
  effectiveTo: null,
  provenance: {
    status: "secondary-cite-only",
    sources: [SRC_R_420_104, SRC_R_420_506, SRC_MCL_333_26424],
  },
  customerKinds: ["MI_ADULT_USE", "MI_MED_PATIENT", "MI_MED_CAREGIVER"],
  adultUseMinAge: {
    value: 21,
    provenance: {
      status: "secondary-cite-only",
      sources: [SRC_R_420_104],
    },
  },
  limitsByCustomerKind: {
    MI_ADULT_USE: [
      // R. 420.506(1): 2.5 oz usable equivalent per transaction.
      { dimension: "TOTAL_OUNCES", max: 2.5, window: "TRANSACTION" },
      // R. 420.506(1): "not more than 15 grams may be in the form of
      // marihuana concentrate" — sub-cap inside the 2.5 oz.
      { dimension: "CONCENTRATE_GRAMS", max: 15, window: "TRANSACTION" },
      // R. 420.506: 3 immature plant cap per transaction.
      { dimension: "IMMATURE_PLANTS", max: 3, window: "TRANSACTION" },
    ],
    MI_MED_PATIENT: [
      // MCL 333.26424: 2.5 oz/day + 10 oz/month possession; day-boundary
      // semantics flagged (Q3).
      { dimension: "TOTAL_OUNCES", max: 2.5, window: "DAY" },
      { dimension: "TOTAL_OUNCES", max: 10, window: "MONTH" },
    ],
    MI_MED_CAREGIVER: [
      // MCL 333.26424: 2.5 oz usable + 12 plants PER CONNECTED PATIENT.
      // The Limit type currently expresses cap-per-transaction, not
      // cap-per-patient. Kernel logic in M1.2 will multiply these limits
      // by the count of patients linked to the caregiver (tracked via
      // cart.customer.servingPatientIdHash, plus a future caregiver-
      // patient-link lookup). Until M1.2 ships, the kernel refuses
      // caregiver transactions with MEDICAL_CAREGIVER_NOT_LINKED.
      { dimension: "TOTAL_OUNCES", max: 2.5, window: "TRANSACTION" },
      { dimension: "IMMATURE_PLANTS", max: 12, window: "TRANSACTION" },
    ],
  },
  limitsProvenance: {
    status: "secondary-cite-only",
    sources: [SRC_R_420_506, SRC_MCL_333_26424],
  },
  // Equivalencies: from MCL 333.26424. 1 oz usable marihuana = 16 oz solid
  // infused = 7 g gaseous infused = 36 fl oz liquid infused. Solid-infused
  // gets factor 1/16; gaseous needs a `form` discriminator we don't model
  // yet; liquid is volume-based and we have no fluid-oz unit. Counsel-Q4.
  //
  // The factor (`gramsPerGramAgainstTotalOunces`) is dimensionless:
  //   1 g of this category contributes `factor` g toward the TOTAL_OUNCES
  //   limit (which the kernel internally tracks in grams via toGrams).
  //
  //   FLOWER, PRE_ROLL: 1 g flower = 1 g of "usable" → factor 1.
  //   CONCENTRATE:      Conservative 1:1 (Q2). Also tracked under the
  //                     15 g CONCENTRATE_GRAMS sub-cap.
  //   EDIBLE:           Mapped to "solid marihuana-infused product"
  //                     equivalency: 16 oz solid = 1 oz usable, so 1 g
  //                     solid → 1/16 g toward total. factor = 0.0625.
  //   IMMATURE_PLANT:   No weight contribution to ounce-cap; tracked
  //                     under IMMATURE_PLANTS dimension only.
  //   INFUSED:          NOT mapped. Requires form (solid/gaseous/liquid)
  //                     to pick equivalency. Kernel refuses.
  //   TOPICAL:          NOT mapped. Statute silent on roll-up; kernel refuses.
  //   OTHER:            Never mapped.
  equivalencies: {
    FLOWER: { gramsPerGramAgainstTotalOunces: 1, categoryDimension: null },
    PRE_ROLL: { gramsPerGramAgainstTotalOunces: 1, categoryDimension: null },
    CONCENTRATE: {
      gramsPerGramAgainstTotalOunces: 1,
      categoryDimension: "CONCENTRATE_GRAMS",
    },
    EDIBLE: {
      gramsPerGramAgainstTotalOunces: 1 / 16,
      categoryDimension: null,
    },
    IMMATURE_PLANT: {
      gramsPerGramAgainstTotalOunces: 0,
      categoryDimension: "IMMATURE_PLANTS",
    },
  },
  equivalenciesProvenance: {
    status: "secondary-cite-only",
    sources: [SRC_R_420_506, SRC_MCL_333_26424],
  },
};
