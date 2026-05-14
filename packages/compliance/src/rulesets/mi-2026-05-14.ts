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
  // Tax block (round-2 A4). MI stacks:
  //   STATE_EXCISE: 10% Marijuana Retailers Excise (MRE), eff. 2018-12-06.
  //     Adult-use only — medical patients (MMFLA) are exempt.
  //   STATE_SALES:  6% sales tax computed on (subtotal + MRE). Applies
  //                 to all customers including medical.
  // Local taxes are per-tenant config (cart.localTaxes); MI municipalities
  // may impose excise via local ordinance, not encoded here.
  // The 24% Wholesale Marijuana Tax (eff. 2026-01-01) is OUT OF SCOPE for
  // a retail dispensary POS — it applies to wholesale-only transactions
  // between licensed establishments, not retail point-of-sale.
  // Counsel review questions:
  //   MI-Q5: Rounding policy (per-line vs subtotal) — not addressed by
  //          Manus. Marked TODO; computeTaxes accepts both but the
  //          fixture's choice gates production correctness.
  //   MI-Q6: Sales-tax base — "subtotal + MRE" is the standard reading
  //          of the dossier's "the sales tax is applied to the subtotal
  //          after the excise tax has been added" sentence. Counsel
  //          should confirm the Department of Treasury writeup matches.
  taxBlock: {
    rates: [
      {
        code: "STATE_EXCISE",
        label: "MI Marijuana Retailers Excise (MRE)",
        rate: 0.1,
        base: "SUBTOTAL",
        excludeCustomerKinds: ["MI_MED_PATIENT"],
      },
      {
        code: "STATE_SALES",
        label: "MI Sales Tax",
        rate: 0.06,
        base: "SUBTOTAL_PLUS_PRIOR_STATE_TAX",
      },
    ],
    rounding: "TODO",
    provenance: {
      status: "secondary-cite-only",
      sources: [
        {
          provider: "manus",
          date: "2026-05-13",
          cite: "About the Marijuana Retailers Excise (MRE) Tax (michigan.gov/treasury) — 10% MRE eff. 2018-12-06",
        },
        {
          provider: "manus",
          date: "2026-05-13",
          cite: "Michigan Treasury — 6% sales tax stacked on subtotal+MRE",
        },
      ],
    },
  },
  // Receipt requirements (round-2 A5). MI doesn't have a comprehensive
  // single-source receipt-content rule; MCL 445.319 ("describe the item
  // and state the price charged") is the floor + MCL 333.27958
  // ("no PII beyond age ID") restricts what we may include.
  receiptBlock: {
    requirements: [
      { field: "STORE_NAME", required: true },
      { field: "STORE_ADDRESS", required: true },
      { field: "LICENSE_NUMBER", required: true },
      { field: "DATETIME", required: true },
      { field: "RECEIPT_ID", required: true },
      {
        field: "ITEM_DESCRIPTION",
        required: true,
        note: "MCL 445.319: 'describe the item' — minimum floor",
      },
      { field: "ITEM_QTY", required: true },
      { field: "ITEM_UNIT_PRICE", required: true },
      { field: "ITEM_LINE_TOTAL", required: true },
      { field: "SUBTOTAL", required: true },
      { field: "TAX_TOTAL_PER_RATE", required: true },
      { field: "TAX_TOTAL_AGGREGATE", required: true },
      { field: "GRAND_TOTAL", required: true },
      { field: "TENDER_TYPE", required: true },
      { field: "TENDER_AMOUNT", required: true },
      { field: "CHANGE_DUE", required: true },
    ],
    notes: [
      "MCL 333.27958: CRA prohibited from requiring PII beyond age ID. Do not print full name, DOB, address, or photo.",
      "Medical sales: registry-card hash may be included but only the hashed form — never the raw registry ID.",
    ],
    provenance: {
      status: "secondary-cite-only",
      sources: [
        {
          provider: "manus",
          date: "2026-05-13",
          cite: "MCL 445.319 (eff. 2011-09-01) — receipt 'describe item + state price'",
        },
        {
          provider: "manus",
          date: "2026-05-13",
          cite: "MCL 333.27958 (eff. 2023-10-19) — PII restriction on cannabis transactions",
        },
      ],
    },
  },
  // Returns policy (round-2 A6 → Mich Admin Code R. 420.214c eff. 2022-03-07).
  returnsPolicy: {
    permittedScenarios: ["ADVERSE_REACTION", "DEFECTIVE", "RECALL"],
    mayResell: false,
    destroyWithinDays: 90,
    driverAcceptsReturns: false,
    seedToSaleAction:
      "Tag returned product as waste in Metrc; create new tagged waste package; track destruction event.",
    externalReportWithinDays: null,
    notes: [
      "R. 420.214c: returns permitted only for adverse reaction or defective product. No general 'change of mind' returns.",
      "Expired product may be returned to the upstream processor under a separate manifest workflow (not a customer return).",
      "Delivery drivers may NOT accept returns at point of delivery — must be returned to the licensed retail location.",
      "Returned product cannot be resold or repackaged.",
    ],
    provenance: {
      status: "agency-confirmed",
      sources: [
        {
          provider: "manus",
          date: "2026-05-13",
          cite: "Mich. Admin. Code R. 420.214c — Product returns. Eff. 2022-03-07",
        },
      ],
    },
  },
  // Recalls policy (round-2 A10 → R. 420.214a / R. 420.214b / Marihuana
  // Rules / MI-Bulletin-49 eff. 2022-05-12).
  recallsPolicy: {
    notifyRegulatorsWithinHours: 24,
    notifyAgencies: ["CRA"],
    quarantineMinHours: null,
    destroyWithinDays: 90,
    systemEntryRequiredBeforeDestruction: true,
    preSaleHoldCheckRequired: true,
    metrcAdverseEventMenu: "Patient",
    notes: [
      "R. 420.214b: 1-business-day CRA notification on recall detection.",
      "Pre-sale workflow MUST verify package status against Metrc (no holds, no recalls) on every transaction.",
      "MI-Bulletin-49 (eff. 2022-05-12): Metrc adverse-event submissions use the 'Patient' menu for BOTH adult-use and medical responses — non-obvious integration detail.",
      "Recalled product must be tagged and destroyed within 90 days; destruction event recorded in Metrc.",
    ],
    provenance: {
      status: "agency-confirmed",
      sources: [
        {
          provider: "manus",
          date: "2026-05-13",
          cite: "Mich. Admin. Code R. 420.214b — Recall notification (eff. 2022-03-07)",
        },
        {
          provider: "manus",
          date: "2026-05-13",
          cite: "MI-Bulletin-49 (CRA, eff. 2022-05-12) — Metrc adverse-response submission via Patient menu",
        },
      ],
    },
  },
};
