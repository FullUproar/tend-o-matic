import { describe, it, expect } from "vitest";
import { computeTaxBreakdown } from "../tax-engine";
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

function ilResCart(lines: LineItem[]): Cart {
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

function flowerLine(price: number, thcPct?: number, pkg = "p1"): LineItem {
  return {
    packageId: pkg,
    category: "FLOWER",
    weight: { value: 3.5, unit: "G" },
    unitPriceCents: price,
    qty: 1,
    tested: true,
    labeled: true,
    recalled: false,
    ...(thcPct !== undefined ? { adjustedThcPct: thcPct } : {}),
  };
}

function infusedLine(price: number, pkg = "p2"): LineItem {
  return {
    packageId: pkg,
    category: "INFUSED",
    weight: { value: 100, unit: "MG_THC" },
    unitPriceCents: price,
    qty: 1,
    tested: true,
    labeled: true,
    recalled: false,
  };
}

describe("Per-line tax attribution — IL", () => {
  it("attributes correct excise rate per line in a mixed cart", () => {
    const cart = ilResCart([
      flowerLine(10000, 20, "low-thc-flower"), // 10% excise
      flowerLine(8000, 40, "high-thc-flower"), // 25% excise
      infusedLine(5000, "infused"), // 20% excise (no THC condition)
    ]);
    const r = computeTaxBreakdown(cart);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const pl = r.breakdown.perLine;
    expect(pl).toHaveLength(3);

    // Line 0: low THC flower -> excise 10% = 1000
    const excise0 = pl[0]!.taxes.find((t) => t.label.includes("Excise"));
    expect(excise0?.amountCents).toBe(1000);
    // Line 1: high THC flower -> excise 25% = 2000
    const excise1 = pl[1]!.taxes.find((t) => t.label.includes("Excise"));
    expect(excise1?.amountCents).toBe(2000);
    // Line 2: infused -> excise 20% = 1000
    const excise2 = pl[2]!.taxes.find((t) => t.label.includes("Excise"));
    expect(excise2?.amountCents).toBe(1000);
  });

  it("pro-rates SUBTOTAL-based ROT across lines proportionally", () => {
    const cart = ilResCart([
      flowerLine(10000, 20, "a"), // subtotal share 10000/15000 = 66.67%
      flowerLine(5000, 20, "b"),  // subtotal share  5000/15000 = 33.33%
    ]);
    const r = computeTaxBreakdown(cart);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    // Adult-use ROT = 6.25% of 15000 = 937.5 → 938 cents total.
    const rot0 = r.breakdown.perLine[0]!.taxes.find((t) => t.label.includes("ROT"));
    const rot1 = r.breakdown.perLine[1]!.taxes.find((t) => t.label.includes("ROT"));
    expect(rot0).toBeDefined();
    expect(rot1).toBeDefined();
    // Total per-line ROT shares sum to aggregate.
    expect((rot0?.amountCents ?? 0) + (rot1?.amountCents ?? 0)).toBe(938);
  });

  it("perLine.totalTaxCents equals sum of components", () => {
    const cart = ilResCart([flowerLine(10000, 20)]);
    const r = computeTaxBreakdown(cart);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const pl = r.breakdown.perLine[0]!;
    const sum = pl.taxes.reduce((a, t) => a + t.amountCents, 0);
    expect(sum).toBe(pl.totalTaxCents);
  });

  it("aggregate matches sum of per-line tax across all lines", () => {
    const cart = ilResCart([
      flowerLine(10000, 20, "a"),
      infusedLine(7500, "b"),
    ]);
    const r = computeTaxBreakdown(cart);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const perLineSum = r.breakdown.perLine.reduce(
      (a, l) => a + l.totalTaxCents,
      0,
    );
    expect(perLineSum).toBe(r.breakdown.totalTaxCents);
  });
});

describe("Per-line tax attribution — MI stacked sales tax", () => {
  it("attributes MRE + sales tax per line in a multi-line MI cart", () => {
    const cart = miAdultCart([
      flowerLine(4000, undefined, "a"),
      flowerLine(6000, undefined, "b"),
    ]);
    const r = computeTaxBreakdown(cart);
    expect(r.ok).toBe(true);
    if (!r.ok) return;

    // MRE = 10% × 10000 subtotal = 1000.
    // Sales = 6% × 11000 = 660.
    // Aggregate: 1660.
    expect(r.breakdown.totalTaxCents).toBe(1660);

    const pl = r.breakdown.perLine;
    expect(pl).toHaveLength(2);
    const sum = pl.reduce((a, l) => a + l.totalTaxCents, 0);
    expect(sum).toBe(1660);

    // Each line carries both MRE and sales-tax components.
    for (const line of pl) {
      const codes = line.taxes.map((t) => t.code);
      expect(codes).toContain("STATE_EXCISE");
      expect(codes).toContain("STATE_SALES");
    }
  });
});
