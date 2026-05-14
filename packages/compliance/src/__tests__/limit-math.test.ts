import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { makeKernel } from "../kernel";
import {
  lineItemContribution,
  cartContributions,
  checkTransactionLimits,
  findUnimplementedWindow,
} from "../limit-math";
import { MI_2026_05_14, IL_2026_05_14 } from "../rulesets";
import type { Cart, LineItem } from "../cart";

const GRAMS_PER_OUNCE = 28.3495;

function miAdultCart(lines: LineItem[] = []): Cart {
  return {
    tenantId: "t1",
    locationId: "l1",
    customer: { kind: "MI_ADULT_USE" },
    ruleset: MI_2026_05_14,
    lines,
    openedAt: "2026-05-14T10:00:00Z",
    idVerified: true,
  };
}

function ilResidentCart(lines: LineItem[] = []): Cart {
  return {
    tenantId: "t1",
    locationId: "l1",
    customer: { kind: "IL_ADULT_USE_RESIDENT" },
    ruleset: IL_2026_05_14,
    lines,
    openedAt: "2026-05-14T10:00:00Z",
    idVerified: true,
  };
}

function flower(grams: number): LineItem {
  return {
    packageId: `pkg-flower-${grams}`,
    category: "FLOWER",
    weight: { value: grams, unit: "G" },
    unitPriceCents: 4000,
    qty: 1,
    tested: true,
    labeled: true,
    recalled: false,
  };
}

function concentrate(grams: number): LineItem {
  return {
    packageId: `pkg-conc-${grams}`,
    category: "CONCENTRATE",
    weight: { value: grams, unit: "G" },
    unitPriceCents: 5000,
    qty: 1,
    tested: true,
    labeled: true,
    recalled: false,
  };
}

function edible(grams: number): LineItem {
  return {
    packageId: `pkg-edible-${grams}`,
    category: "EDIBLE",
    weight: { value: grams, unit: "G" },
    unitPriceCents: 2000,
    qty: 1,
    tested: true,
    labeled: true,
    recalled: false,
  };
}

function infusedMg(mgThc: number): LineItem {
  return {
    packageId: `pkg-infused-${mgThc}`,
    category: "INFUSED",
    weight: { value: mgThc, unit: "MG_THC" },
    unitPriceCents: 2500,
    qty: 1,
    tested: true,
    labeled: true,
    recalled: false,
  };
}

describe("lineItemContribution — MI", () => {
  const eq = MI_2026_05_14.equivalencies;

  it("FLOWER 28g rolls to ~0.988 oz toward TOTAL_OUNCES", () => {
    const r = lineItemContribution(flower(28), eq);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.contributions.get("TOTAL_OUNCES")).toBeCloseTo(
        28 / GRAMS_PER_OUNCE,
        6,
      );
      expect(r.contributions.get("CONCENTRATE_GRAMS")).toBeUndefined();
    }
  });

  it("CONCENTRATE 5g contributes to BOTH TOTAL_OUNCES and CONCENTRATE_GRAMS", () => {
    const r = lineItemContribution(concentrate(5), eq);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.contributions.get("TOTAL_OUNCES")).toBeCloseTo(
        5 / GRAMS_PER_OUNCE,
        6,
      );
      expect(r.contributions.get("CONCENTRATE_GRAMS")).toBe(5);
    }
  });

  it("EDIBLE 100g contributes only 100/16 g equivalent toward TOTAL_OUNCES", () => {
    const r = lineItemContribution(edible(100), eq);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.contributions.get("TOTAL_OUNCES")).toBeCloseTo(
        100 / 16 / GRAMS_PER_OUNCE,
        6,
      );
    }
  });

  it("qty multiplies contribution", () => {
    const r = lineItemContribution({ ...flower(3.5), qty: 3 }, eq);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.contributions.get("TOTAL_OUNCES")).toBeCloseTo(
        (3.5 * 3) / GRAMS_PER_OUNCE,
        6,
      );
    }
  });

  it("refuses INFUSED on MI (counsel-Q4 unmapped)", () => {
    const r = lineItemContribution(infusedMg(100), eq);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason.code).toBe("EQUIVALENCY_UNDEFINED");
  });
});

describe("lineItemContribution — IL", () => {
  const eq = IL_2026_05_14.equivalencies;

  it("FLOWER routes only to FLOWER_GRAMS (no roll-up)", () => {
    const r = lineItemContribution(flower(10), eq);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.contributions.get("FLOWER_GRAMS")).toBe(10);
      expect(r.contributions.get("TOTAL_OUNCES")).toBeUndefined();
    }
  });

  it("INFUSED requires MG_THC weight; refuses grams", () => {
    const r = lineItemContribution(
      {
        ...infusedMg(100),
        weight: { value: 1, unit: "G" },
      },
      eq,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason.code).toBe("WEIGHT_UNIT_INCOMPATIBLE");
  });

  it("INFUSED 250mg routes to INFUSED_MG_THC", () => {
    const r = lineItemContribution(infusedMg(250), eq);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.contributions.get("INFUSED_MG_THC")).toBe(250);
  });

  it("CONCENTRATE 5g routes only to CONCENTRATE_GRAMS (no roll-up)", () => {
    const r = lineItemContribution(concentrate(5), eq);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.contributions.get("CONCENTRATE_GRAMS")).toBe(5);
      expect(r.contributions.get("TOTAL_OUNCES")).toBeUndefined();
    }
  });
});

describe("checkTransactionLimits — MI adult-use 2.5 oz", () => {
  const kernel = makeKernel({ requireRulesetStatus: "secondary-cite-only" });

  it("accepts a cart at exactly the 2.5 oz cap", () => {
    const grams = 2.5 * GRAMS_PER_OUNCE; // 70.87375
    const cart = miAdultCart();
    const r = kernel.applyLineItem(cart, flower(grams));
    expect(r.ok).toBe(true);
  });

  it("refuses a cart that pushes past 2.5 oz", () => {
    const grams = 2.5 * GRAMS_PER_OUNCE + 0.01;
    const r = kernel.applyLineItem(miAdultCart(), flower(grams));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reason.code).toBe("LIMIT_EXCEEDED");
      if (r.reason.code === "LIMIT_EXCEEDED") {
        expect(r.reason.dimension).toBe("TOTAL_OUNCES");
        expect(r.reason.window).toBe("TRANSACTION");
      }
    }
  });

  it("refuses CONCENTRATE-only at 16g (within 2.5oz total but over 15g concentrate sub-cap)", () => {
    const r = kernel.applyLineItem(miAdultCart(), concentrate(16));
    expect(r.ok).toBe(false);
    if (!r.ok && r.reason.code === "LIMIT_EXCEEDED") {
      expect(r.reason.dimension).toBe("CONCENTRATE_GRAMS");
      expect(r.reason.max).toBe(15);
    }
  });

  it("accepts the 15g concentrate sub-cap exactly", () => {
    const r = kernel.applyLineItem(miAdultCart(), concentrate(15));
    expect(r.ok).toBe(true);
  });

  it("mixed cart: 1oz flower + 14g concentrate stays under both caps", () => {
    const cart1 = miAdultCart();
    const r1 = kernel.applyLineItem(cart1, flower(GRAMS_PER_OUNCE)); // 1 oz
    expect(r1.ok).toBe(true);
    if (r1.ok) {
      const r2 = kernel.applyLineItem(r1.cart, concentrate(14));
      expect(r2.ok).toBe(true);
    }
  });

  it("mixed cart: 2 oz flower + 15g concentrate breaches 2.5oz total (1g over)", () => {
    const cart1 = miAdultCart();
    const r1 = kernel.applyLineItem(cart1, flower(2 * GRAMS_PER_OUNCE));
    expect(r1.ok).toBe(true);
    if (r1.ok) {
      const r2 = kernel.applyLineItem(r1.cart, concentrate(15));
      // 2 oz flower (2 oz) + 15g concentrate (15/28.35 = 0.529 oz) = 2.529 oz
      // > 2.5 oz cap. Concentrate sub-cap (15g) is exactly at max but
      // total-ounces is exceeded.
      expect(r2.ok).toBe(false);
      if (!r2.ok && r2.reason.code === "LIMIT_EXCEEDED") {
        expect(r2.reason.dimension).toBe("TOTAL_OUNCES");
      }
    }
  });
});

describe("checkTransactionLimits — IL adult-use", () => {
  const kernel = makeKernel({ requireRulesetStatus: "secondary-cite-only" });

  it("resident: 30g flower exactly at cap", () => {
    const r = kernel.applyLineItem(ilResidentCart(), flower(30));
    expect(r.ok).toBe(true);
  });

  it("resident: 30.5g flower over cap", () => {
    const r = kernel.applyLineItem(ilResidentCart(), flower(30.5));
    expect(r.ok).toBe(false);
    if (!r.ok && r.reason.code === "LIMIT_EXCEEDED") {
      expect(r.reason.dimension).toBe("FLOWER_GRAMS");
      expect(r.reason.max).toBe(30);
    }
  });

  it("resident: 500mg THC infused exactly at cap", () => {
    const r = kernel.applyLineItem(ilResidentCart(), infusedMg(500));
    expect(r.ok).toBe(true);
  });

  it("resident: independent categories — 30g flower + 5g concentrate + 500mg THC all valid together", () => {
    const c1 = ilResidentCart();
    const r1 = kernel.applyLineItem(c1, flower(30));
    expect(r1.ok).toBe(true);
    if (r1.ok) {
      const r2 = kernel.applyLineItem(r1.cart, concentrate(5));
      expect(r2.ok).toBe(true);
      if (r2.ok) {
        const r3 = kernel.applyLineItem(r2.cart, infusedMg(500));
        expect(r3.ok).toBe(true);
      }
    }
  });

  it("non-resident: 15g flower exactly at cap, 16g over", () => {
    const nonRes: Cart = {
      ...ilResidentCart(),
      customer: { kind: "IL_ADULT_USE_NONRESIDENT" },
    };
    const r1 = kernel.applyLineItem(nonRes, flower(15));
    expect(r1.ok).toBe(true);
    const r2 = kernel.applyLineItem(nonRes, flower(16));
    expect(r2.ok).toBe(false);
  });
});

describe("non-transaction-window customers refuse (M1.2 limitation)", () => {
  const kernel = makeKernel({ requireRulesetStatus: "secondary-cite-only" });

  it("MI medical patient refuses with LIMIT_WINDOW_NOT_IMPLEMENTED", () => {
    const cart: Cart = {
      ...miAdultCart(),
      customer: { kind: "MI_MED_PATIENT", registryIdHash: "h1" },
    };
    const r = kernel.applyLineItem(cart, flower(1));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reason.code).toBe("LIMIT_WINDOW_NOT_IMPLEMENTED");
      if (r.reason.code === "LIMIT_WINDOW_NOT_IMPLEMENTED") {
        expect(["DAY", "MONTH"]).toContain(r.reason.window);
      }
    }
  });

  it("IL medical patient refuses (14-day window)", () => {
    const cart: Cart = {
      ...ilResidentCart(),
      customer: { kind: "IL_MED_PATIENT", registryIdHash: "h2" },
    };
    const r = kernel.applyLineItem(cart, flower(1));
    expect(r.ok).toBe(false);
    if (!r.ok && r.reason.code === "LIMIT_WINDOW_NOT_IMPLEMENTED") {
      expect(r.reason.window).toBe("FOURTEEN_DAYS");
    }
  });
});

describe("findUnimplementedWindow direct", () => {
  it("returns null for MI_ADULT_USE (all TRANSACTION)", () => {
    expect(findUnimplementedWindow("MI_ADULT_USE", MI_2026_05_14)).toBeNull();
  });

  it("returns the first DAY limit for MI_MED_PATIENT", () => {
    const l = findUnimplementedWindow("MI_MED_PATIENT", MI_2026_05_14);
    expect(l).not.toBeNull();
    expect(["DAY", "MONTH"]).toContain(l?.window);
  });

  it("returns the first FOURTEEN_DAYS limit for IL_MED_PATIENT", () => {
    const l = findUnimplementedWindow("IL_MED_PATIENT", IL_2026_05_14);
    expect(l?.window).toBe("FOURTEEN_DAYS");
  });
});

describe("property: any cart of FLOWER lines totaling > 2.5oz refuses on MI adult-use", () => {
  const kernel = makeKernel({ requireRulesetStatus: "secondary-cite-only" });
  const cap = 2.5 * GRAMS_PER_OUNCE;

  it("over-cap flower-only carts refuse with LIMIT_EXCEEDED on TOTAL_OUNCES", () => {
    fc.assert(
      fc.property(
        fc.double({
          min: cap + 0.5,
          max: cap + 100,
          noNaN: true,
          noDefaultInfinity: true,
        }),
        (overGrams) => {
          const r = kernel.applyLineItem(miAdultCart(), flower(overGrams));
          if (r.ok) return false;
          if (r.reason.code !== "LIMIT_EXCEEDED") return false;
          return r.reason.dimension === "TOTAL_OUNCES";
        },
      ),
      { numRuns: 30 },
    );
  });

  it("under-cap flower-only carts accept", () => {
    fc.assert(
      fc.property(
        fc.double({
          min: 0.001,
          max: cap - 0.5,
          noNaN: true,
          noDefaultInfinity: true,
        }),
        (underGrams) => {
          const r = kernel.applyLineItem(miAdultCart(), flower(underGrams));
          return r.ok;
        },
      ),
      { numRuns: 30 },
    );
  });
});

describe("checkLimits emits status array on transaction-window-only customers", () => {
  const kernel = makeKernel({ requireRulesetStatus: "secondary-cite-only" });

  it("MI adult-use empty cart reports zero usage across all transaction dimensions", () => {
    const r = kernel.checkLimits(miAdultCart());
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.statuses.length).toBeGreaterThan(0);
      for (const s of r.statuses) {
        expect(s.used).toBe(0);
        expect(s.remaining).toBe(s.max);
      }
    }
  });

  it("IL resident with 20g flower in cart reports 20g used against 30g FLOWER_GRAMS cap", () => {
    const cart = ilResidentCart([flower(20)]);
    const r = kernel.checkLimits(cart);
    expect(r.ok).toBe(true);
    if (r.ok) {
      const flowerStatus = r.statuses.find(
        (s) => s.dimension === "FLOWER_GRAMS",
      );
      expect(flowerStatus?.used).toBe(20);
      expect(flowerStatus?.remaining).toBe(10);
    }
  });
});
