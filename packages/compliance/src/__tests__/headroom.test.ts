import { describe, it, expect } from "vitest";
import { cartHeadroom } from "../limit-math";
import { MI_2026_05_14, IL_2026_05_14 } from "../rulesets";
import type { Cart, LineItem } from "../cart";

function miAdultCart(lines: LineItem[]): Cart {
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

function miMedicalCart(): Cart {
  return {
    tenantId: "t1",
    locationId: "l1",
    customer: { kind: "MI_MED_PATIENT", registryIdHash: "h1" },
    ruleset: MI_2026_05_14,
    lines: [],
    openedAt: "2026-05-14T10:00:00Z",
    idVerified: true,
  };
}

function flower(grams: number, pkg = "p1"): LineItem {
  return {
    packageId: pkg,
    category: "FLOWER",
    weight: { value: grams, unit: "G" },
    unitPriceCents: 4000,
    qty: 1,
    tested: true,
    labeled: true,
    recalled: false,
  };
}

describe("cartHeadroom — MI adult-use (TRANSACTION windows only)", () => {
  it("empty cart shows 0 used and full remaining against each limit", () => {
    const hr = cartHeadroom(miAdultCart([]));
    // MI adult-use has 3 limits: TOTAL_OUNCES (2.5), CONCENTRATE_GRAMS
    // (15), IMMATURE_PLANTS (3). All TRANSACTION.
    expect(hr).toHaveLength(3);
    for (const h of hr) {
      expect(h.window).toBe("TRANSACTION");
      expect(h.fromCartOnly).toBe(true);
      expect(h.priorUsageNeeded).toBe(false);
      expect(h.used).toBe(0);
      expect(h.percentUsed).toBe(0);
      expect(h.remaining).toBe(h.max);
    }
  });

  it("14 g flower in cart reports ~0.494 oz used / ~2.006 oz remaining (TOTAL_OUNCES)", () => {
    const hr = cartHeadroom(miAdultCart([flower(14)]));
    const totalOz = hr.find((h) => h.dimension === "TOTAL_OUNCES")!;
    expect(totalOz.used).toBeGreaterThan(0.49);
    expect(totalOz.used).toBeLessThan(0.5);
    expect(totalOz.remaining).toBeGreaterThan(2.0);
    expect(totalOz.remaining).toBeLessThan(2.01);
    expect(totalOz.percentUsed).toBeGreaterThan(0.19);
    expect(totalOz.percentUsed).toBeLessThan(0.21);
  });

  it("at the cap (70.87 g flower ≈ 2.5 oz) percentUsed ≈ 1.0", () => {
    const hr = cartHeadroom(miAdultCart([flower(70.87)]));
    const totalOz = hr.find((h) => h.dimension === "TOTAL_OUNCES")!;
    expect(totalOz.percentUsed).toBeGreaterThan(0.999);
    expect(totalOz.percentUsed).toBeLessThan(1.001);
    expect(totalOz.remaining).toBeLessThan(0.01);
  });

  it("remaining clamps to 0 instead of going negative when cart is over-cap", () => {
    // This shouldn't happen in practice (kernel refuses these adds),
    // but cartHeadroom should be defensive.
    const hr = cartHeadroom(miAdultCart([flower(80)])); // over 2.5oz
    const totalOz = hr.find((h) => h.dimension === "TOTAL_OUNCES")!;
    expect(totalOz.remaining).toBe(0);
    expect(totalOz.percentUsed).toBeGreaterThan(1.0);
  });
});

describe("cartHeadroom — medical (window not yet enforced)", () => {
  it("flags MI medical day/month limits as priorUsageNeeded", () => {
    const hr = cartHeadroom(miMedicalCart());
    // MI medical has 2 limits: 2.5oz/DAY + 10oz/MONTH.
    expect(hr).toHaveLength(2);
    for (const h of hr) {
      expect(["DAY", "MONTH"]).toContain(h.window);
      expect(h.priorUsageNeeded).toBe(true);
      expect(h.fromCartOnly).toBe(false);
      // We don't know used; report 0 + full remaining as placeholders.
      expect(h.used).toBe(0);
      expect(h.remaining).toBe(h.max);
    }
  });
});

describe("cartHeadroom — IL adult-use per-category caps", () => {
  it("emits one entry per category cap (FLOWER_GRAMS / CONCENTRATE_GRAMS / INFUSED_MG_THC)", () => {
    const cart: Cart = {
      tenantId: "t1",
      locationId: "l1",
      customer: { kind: "IL_ADULT_USE_RESIDENT" },
      ruleset: IL_2026_05_14,
      lines: [{ ...flower(15), adjustedThcPct: 20 }],
      openedAt: "2026-05-14T10:00:00Z",
      idVerified: true,
    };
    const hr = cartHeadroom(cart);
    expect(hr).toHaveLength(3);
    const flowerHr = hr.find((h) => h.dimension === "FLOWER_GRAMS")!;
    expect(flowerHr.used).toBe(15);
    expect(flowerHr.max).toBe(30);
    expect(flowerHr.remaining).toBe(15);
    expect(flowerHr.percentUsed).toBe(0.5);
  });
});
