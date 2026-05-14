import type { Ruleset } from "../ruleset";

// Illinois fixture ruleset.
// Status: `secondary-cite-only`. The kernel refuses to load this ruleset
// in production (which requires `counsel-verified`).
//
// Round-2 (manus-2026-05-13) closed the IL transaction-vs-possession,
// equivalency, and medical-patient gaps. IL differs structurally from MI:
//   - Adult-use limits are PER-CATEGORY (flower / infused / concentrate)
//     and do NOT roll up to a single ounce-equivalent. Each category has
//     its own independent cap. The equivalency table maps each category
//     to its own dimension (factor 0 against TOTAL_OUNCES).
//   - Medical limits are 2.5 oz USABLE over a ROLLING 14 DAYS. This is
//     the only window-type that's neither "transaction" nor calendar; the
//     LimitWindow type was extended with FOURTEEN_DAYS to support this.
//
// Counsel review questions for this fixture:
//   Q1 (B3): The June 2025 CROO doc states 21.3 g THC equivalency for
//       vapes/concentrates against the 2.5 oz/14-day cap; the Sept 22 2025
//       CROO doc states 26.6 g. Encoded the newer value (26.6 g) here.
//       Counsel must confirm which is current.
//   Q2 (B2): "Cumulative" phrasing in CROO FAQs is ambiguous (per-category
//       caps vs combined cap). Encoded as INDEPENDENT per-category caps,
//       which is the standard CRTA reading.
//   Q3 (B2): Package-level 100 mg THC cap and per-serving 10 mg THC cap
//       are PRODUCT-CATALOG validations, not cart-level. Not encoded in
//       this ruleset; will be enforced at product ingest in M3.

const SRC_CRTA = {
  provider: "manus",
  date: "2026-05-13",
  cite: "Illinois Cannabis Regulation and Tax Act (410 ILCS 705) — P.A. 101-27 eff. 2019-06-25; am. P.A. 101-593 eff. 2019-12-04",
  url: "https://ilga.gov/legislation/ilcs/ilcs5.asp?ActID=3992",
};
const SRC_CROO_FAQ_2025_09_22 = {
  provider: "manus",
  date: "2026-05-13",
  cite: "Illinois Cannabis Regulation Oversight Office FAQ + 'Medical Cannabis Limits, Explained' (2025-09-22)",
};
const SRC_MEDICAL_CANNABIS_ACT = {
  provider: "manus",
  date: "2026-05-13",
  cite: "Compassionate Use of Medical Cannabis Program Act (410 ILCS 130/10)",
};

export const IL_2026_05_14: Ruleset = {
  jurisdiction: "IL",
  version: "il-2026.05.14",
  effectiveFrom: "2026-05-14",
  effectiveTo: null,
  provenance: {
    status: "secondary-cite-only",
    sources: [SRC_CRTA, SRC_CROO_FAQ_2025_09_22, SRC_MEDICAL_CANNABIS_ACT],
  },
  customerKinds: [
    "IL_ADULT_USE_RESIDENT",
    "IL_ADULT_USE_NONRESIDENT",
    "IL_MED_PATIENT",
  ],
  adultUseMinAge: {
    value: 21,
    provenance: { status: "secondary-cite-only", sources: [SRC_CRTA] },
  },
  limitsByCustomerKind: {
    IL_ADULT_USE_RESIDENT: [
      // 410 ILCS 705/10-10: resident adult-use caps. Independent per category.
      { dimension: "FLOWER_GRAMS", max: 30, window: "TRANSACTION" },
      { dimension: "INFUSED_MG_THC", max: 500, window: "TRANSACTION" },
      { dimension: "CONCENTRATE_GRAMS", max: 5, window: "TRANSACTION" },
    ],
    IL_ADULT_USE_NONRESIDENT: [
      // Non-resident caps are exactly half the resident caps.
      { dimension: "FLOWER_GRAMS", max: 15, window: "TRANSACTION" },
      { dimension: "INFUSED_MG_THC", max: 250, window: "TRANSACTION" },
      { dimension: "CONCENTRATE_GRAMS", max: 2.5, window: "TRANSACTION" },
    ],
    IL_MED_PATIENT: [
      // 410 ILCS 130/10: 2.5 oz usable per ROLLING 14-day window.
      // Conversion math (B3, 2025-09-22 CROO): the 2.5 oz/70.87 g equivalent
      // applies across categories simultaneously; counsel-Q1 reconciles
      // June (21.3 g) vs Sept (26.6 g) THC equivalencies. The kernel's
      // M1.2 limit math will read THESE caps as the allowed per-category
      // contribution toward the SAME 14-day window, using the equivalency
      // table below to determine per-category contribution weight.
      { dimension: "FLOWER_GRAMS", max: 70.87, window: "FOURTEEN_DAYS" },
      // Vapes/Concentrate: 26.6 g THC equivalency per Sept 2025 CROO.
      // Counsel-Q1: confirm vs June 2025 value of 21.3 g.
      { dimension: "INFUSED_MG_THC", max: 26600, window: "FOURTEEN_DAYS" },
      { dimension: "CONCENTRATE_GRAMS", max: 26.6, window: "FOURTEEN_DAYS" },
    ],
  },
  limitsProvenance: {
    status: "secondary-cite-only",
    sources: [SRC_CRTA, SRC_CROO_FAQ_2025_09_22, SRC_MEDICAL_CANNABIS_ACT],
  },
  // Equivalencies: IL adult-use caps are per-category and DO NOT roll up
  // to TOTAL_OUNCES. Factor against total-ounces is 0 for all categories.
  // Each category maps to its own LimitDimension so the kernel's M1.2
  // limit math can route a line item's weight into the right dimension.
  //
  //   FLOWER, PRE_ROLL → FLOWER_GRAMS (weight in grams, factor 1)
  //   CONCENTRATE      → CONCENTRATE_GRAMS
  //   INFUSED, EDIBLE  → INFUSED_MG_THC (weight expressed in MG_THC unit;
  //                      kernel reads weight.value directly, not via grams)
  //   TOPICAL          → INFUSED_MG_THC (CRTA treats topicals as infused)
  //   IMMATURE_PLANT   → NOT MAPPED (IL has no adult-use home-grow; refuse)
  //   OTHER            → never mapped
  equivalencies: {
    FLOWER: {
      gramsPerGramAgainstTotalOunces: 0,
      categoryDimension: "FLOWER_GRAMS",
    },
    PRE_ROLL: {
      gramsPerGramAgainstTotalOunces: 0,
      categoryDimension: "FLOWER_GRAMS",
    },
    CONCENTRATE: {
      gramsPerGramAgainstTotalOunces: 0,
      categoryDimension: "CONCENTRATE_GRAMS",
    },
    INFUSED: {
      gramsPerGramAgainstTotalOunces: 0,
      categoryDimension: "INFUSED_MG_THC",
    },
    EDIBLE: {
      gramsPerGramAgainstTotalOunces: 0,
      categoryDimension: "INFUSED_MG_THC",
    },
    TOPICAL: {
      gramsPerGramAgainstTotalOunces: 0,
      categoryDimension: "INFUSED_MG_THC",
    },
  },
  equivalenciesProvenance: {
    status: "secondary-cite-only",
    sources: [SRC_CRTA, SRC_CROO_FAQ_2025_09_22],
  },
  // Tax block (round-2 B4). IL has three statutory layers:
  //
  // 1. Cannabis Purchaser Excise Tax (per-line, category & THC% driven):
  //    - Non-infused (FLOWER/PRE_ROLL/CONCENTRATE, includes vapes per
  //      B4 note) with adjusted THC ≤ 35%: 10%
  //    - Non-infused with adjusted THC > 35%: 25%
  //    - Cannabis-infused products (EDIBLE/INFUSED/TOPICAL): 20%
  //    - Medical cannabis: EXEMPT.
  //    Adjusted THC formula (CRTA): Δ9-THC% + 0.877 × THCA%.
  //    Each line MUST carry `adjustedThcPct` for non-infused categories;
  //    absence is a TAX_INPUT_MISSING refusal.
  //
  // 2. State Retailers' Occupation Tax (sales-style, on subtotal):
  //    - Adult-use: 6.25%
  //    - Medical: 1% (qualifying-drug rate)
  //
  // 3. Local cannabis taxes (per-tenant config in cart.localTaxes —
  //    not encoded here). Caps are statutory:
  //    ≤3% municipal + ≤3.75% county (unincorporated) / 3% (incorporated).
  //
  // Counsel review questions:
  //   IL-Q4: Adjusted-THC computation timing — Manus B4 notes the formula
  //          but doesn't address how the POS verifies/sources lab-COA
  //          THC at line level. Encoding: the POS application supplies
  //          per-product `adjustedThcPct`; M3 product-catalog work will
  //          enforce its presence at ingest.
  taxBlock: {
    rates: [
      // Cannabis Purchaser Excise — non-infused, ≤35% THC: 10%
      {
        code: "STATE_EXCISE",
        label: "IL Cannabis Excise (≤35% THC)",
        rate: 0.1,
        base: "LINE_PRICE",
        onlyForCategories: ["FLOWER", "PRE_ROLL", "CONCENTRATE"],
        thcCondition: { op: "lte", pct: 35 },
        excludeCustomerKinds: ["IL_MED_PATIENT"],
      },
      // Cannabis Purchaser Excise — non-infused, >35% THC: 25%
      {
        code: "STATE_EXCISE",
        label: "IL Cannabis Excise (>35% THC)",
        rate: 0.25,
        base: "LINE_PRICE",
        onlyForCategories: ["FLOWER", "PRE_ROLL", "CONCENTRATE"],
        thcCondition: { op: "gt", pct: 35 },
        excludeCustomerKinds: ["IL_MED_PATIENT"],
      },
      // Cannabis Purchaser Excise — infused/edible/topical: flat 20%
      {
        code: "STATE_EXCISE",
        label: "IL Cannabis Excise (Infused)",
        rate: 0.2,
        base: "LINE_PRICE",
        onlyForCategories: ["INFUSED", "EDIBLE", "TOPICAL"],
        excludeCustomerKinds: ["IL_MED_PATIENT"],
      },
      // State Retailers' Occupation Tax — adult-use: 6.25%
      {
        code: "STATE_SALES",
        label: "IL State ROT (Adult-use)",
        rate: 0.0625,
        base: "SUBTOTAL",
        excludeCustomerKinds: ["IL_MED_PATIENT"],
      },
      // State Retailers' Occupation Tax — medical: 1%
      {
        code: "STATE_SALES",
        label: "IL State ROT (Medical)",
        rate: 0.01,
        base: "SUBTOTAL",
        onlyCustomerKinds: ["IL_MED_PATIENT"],
      },
    ],
    rounding: "PER_SUBTOTAL",
    provenance: {
      status: "secondary-cite-only",
      sources: [
        {
          provider: "manus",
          date: "2026-05-13",
          cite: "Illinois Department of Revenue: Cannabis Taxes (tax.illinois.gov) + 410 ILCS 705/65 (excise + ROT)",
          url: "https://tax.illinois.gov/research/taxinformation/excise/cannabis.html",
        },
      ],
    },
  },
};
