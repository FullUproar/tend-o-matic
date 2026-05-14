import { describe, it, expect } from "vitest";
import { MI_2026_05_14, IL_2026_05_14 } from "../rulesets";

describe("MI equivalency table (manus-2026-05-13 → MCL 333.26424)", () => {
  const eq = MI_2026_05_14.equivalencies;

  it("has FLOWER and PRE_ROLL at factor 1, no category dimension", () => {
    expect(eq.FLOWER).toEqual({
      gramsPerGramAgainstTotalOunces: 1,
      categoryDimension: null,
    });
    expect(eq.PRE_ROLL).toEqual({
      gramsPerGramAgainstTotalOunces: 1,
      categoryDimension: null,
    });
  });

  it("has CONCENTRATE rolling up 1:1 with the 15g sub-cap (counsel-Q2)", () => {
    expect(eq.CONCENTRATE?.gramsPerGramAgainstTotalOunces).toBe(1);
    expect(eq.CONCENTRATE?.categoryDimension).toBe("CONCENTRATE_GRAMS");
  });

  it("has EDIBLE at solid-infused factor 1/16", () => {
    expect(eq.EDIBLE?.gramsPerGramAgainstTotalOunces).toBeCloseTo(0.0625, 6);
    expect(eq.EDIBLE?.categoryDimension).toBeNull();
  });

  it("has IMMATURE_PLANT tracked only under its category dimension", () => {
    expect(eq.IMMATURE_PLANT?.gramsPerGramAgainstTotalOunces).toBe(0);
    expect(eq.IMMATURE_PLANT?.categoryDimension).toBe("IMMATURE_PLANTS");
  });

  it("does NOT map INFUSED / TOPICAL / OTHER (form discriminator required — counsel-Q4)", () => {
    expect(eq.INFUSED).toBeUndefined();
    expect(eq.TOPICAL).toBeUndefined();
    expect(eq.OTHER).toBeUndefined();
  });

  it("equivalencies provenance bumped to secondary-cite-only", () => {
    expect(MI_2026_05_14.equivalenciesProvenance.status).toBe(
      "secondary-cite-only",
    );
  });
});

describe("IL equivalency table (manus-2026-05-13 → 410 ILCS 705 + CROO)", () => {
  const eq = IL_2026_05_14.equivalencies;

  it("does NOT roll up to TOTAL_OUNCES (all factors are 0 — per-category caps)", () => {
    for (const c of [
      "FLOWER",
      "PRE_ROLL",
      "CONCENTRATE",
      "INFUSED",
      "EDIBLE",
      "TOPICAL",
    ] as const) {
      expect(eq[c]?.gramsPerGramAgainstTotalOunces).toBe(0);
    }
  });

  it("maps FLOWER and PRE_ROLL to FLOWER_GRAMS", () => {
    expect(eq.FLOWER?.categoryDimension).toBe("FLOWER_GRAMS");
    expect(eq.PRE_ROLL?.categoryDimension).toBe("FLOWER_GRAMS");
  });

  it("maps CONCENTRATE to CONCENTRATE_GRAMS", () => {
    expect(eq.CONCENTRATE?.categoryDimension).toBe("CONCENTRATE_GRAMS");
  });

  it("maps INFUSED, EDIBLE, and TOPICAL to INFUSED_MG_THC (CRTA treats topicals as infused — counsel-Q?)", () => {
    expect(eq.INFUSED?.categoryDimension).toBe("INFUSED_MG_THC");
    expect(eq.EDIBLE?.categoryDimension).toBe("INFUSED_MG_THC");
    expect(eq.TOPICAL?.categoryDimension).toBe("INFUSED_MG_THC");
  });

  it("does NOT map IMMATURE_PLANT (IL has no adult-use home grow)", () => {
    expect(eq.IMMATURE_PLANT).toBeUndefined();
  });

  it("equivalencies provenance bumped to secondary-cite-only", () => {
    expect(IL_2026_05_14.equivalenciesProvenance.status).toBe(
      "secondary-cite-only",
    );
  });
});

describe("IL medical 14-day window (counsel-Q1: vape THC conflict)", () => {
  const meds = IL_2026_05_14.limitsByCustomerKind.IL_MED_PATIENT;

  it("encodes 70.87 g flower equivalency over FOURTEEN_DAYS", () => {
    expect(meds).toContainEqual({
      dimension: "FLOWER_GRAMS",
      max: 70.87,
      window: "FOURTEEN_DAYS",
    });
  });

  it("uses 26.6 g THC (newer 2025-09-22 CROO value, not June 21.3 g)", () => {
    expect(meds).toContainEqual({
      dimension: "INFUSED_MG_THC",
      max: 26600,
      window: "FOURTEEN_DAYS",
    });
  });
});

describe("MI caregiver per-patient limits (counsel-Q: per-patient math in M1.2)", () => {
  const careg = MI_2026_05_14.limitsByCustomerKind.MI_MED_CAREGIVER;

  it("encodes 2.5 oz usable per-transaction (multiplied by patient count in M1.2)", () => {
    expect(careg).toContainEqual({
      dimension: "TOTAL_OUNCES",
      max: 2.5,
      window: "TRANSACTION",
    });
  });

  it("encodes 12 plants per-transaction (per-patient cap)", () => {
    expect(careg).toContainEqual({
      dimension: "IMMATURE_PLANTS",
      max: 12,
      window: "TRANSACTION",
    });
  });
});
