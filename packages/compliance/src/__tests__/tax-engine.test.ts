import { describe, it, expect } from "vitest";
import { makeKernel } from "../kernel";
import { computeTaxBreakdown } from "../tax-engine";
import { MI_2026_05_14, IL_2026_05_14 } from "../rulesets";
import type { Cart, LineItem } from "../cart";
import type { TaxRate } from "../tax";

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

function miPatientCart(lines: LineItem[] = []): Cart {
  return {
    ...miAdultCart(lines),
    customer: { kind: "MI_MED_PATIENT", registryIdHash: "abc" },
  };
}

function ilResCart(lines: LineItem[] = []): Cart {
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

function ilMedCart(lines: LineItem[] = []): Cart {
  return {
    ...ilResCart(lines),
    customer: { kind: "IL_MED_PATIENT", registryIdHash: "abc" },
  };
}

function flowerLine(priceCents: number, qty = 1, thcPct?: number): LineItem {
  return {
    packageId: `pkg-${priceCents}-${qty}`,
    category: "FLOWER",
    weight: { value: 3.5, unit: "G" },
    unitPriceCents: priceCents,
    qty,
    tested: true,
    labeled: true,
    recalled: false,
    adjustedThcPct: thcPct,
  };
}

function infusedLine(priceCents: number, qty = 1): LineItem {
  return {
    packageId: `pkg-inf-${priceCents}-${qty}`,
    category: "INFUSED",
    weight: { value: 100, unit: "MG_THC" },
    unitPriceCents: priceCents,
    qty,
    tested: true,
    labeled: true,
    recalled: false,
  };
}

function concentrateLine(
  priceCents: number,
  thcPct: number,
  qty = 1,
): LineItem {
  return {
    packageId: `pkg-conc-${priceCents}-${qty}`,
    category: "CONCENTRATE",
    weight: { value: 1, unit: "G" },
    unitPriceCents: priceCents,
    qty,
    tested: true,
    labeled: true,
    recalled: false,
    adjustedThcPct: thcPct,
  };
}

describe("MI tax engine (round-2 A4) — MRE + sales stacked", () => {
  it("$50 flower adult-use: 10% MRE + 6% sales on (50 + 5) = $5 MRE + $3.30 sales", () => {
    const r = computeTaxBreakdown(miAdultCart([flowerLine(5000)]));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.breakdown.subtotalCents).toBe(5000);

    const mre = r.breakdown.lines.find((l) => l.code === "STATE_EXCISE");
    expect(mre).toBeDefined();
    expect(mre!.amountCents).toBe(500); // 10% of 5000

    const sales = r.breakdown.lines.find((l) => l.code === "STATE_SALES");
    expect(sales).toBeDefined();
    // 6% of (5000 + 500) = 330
    expect(sales!.amountCents).toBe(330);

    expect(r.breakdown.totalTaxCents).toBe(830);
    expect(r.breakdown.grandTotalCents).toBe(5830);
  });

  it("MI medical patient is EXEMPT from MRE (only 6% sales on subtotal)", () => {
    const r = computeTaxBreakdown(miPatientCart([flowerLine(5000)]));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const hasMRE = r.breakdown.lines.some((l) => l.code === "STATE_EXCISE");
    expect(hasMRE).toBe(false);
    const sales = r.breakdown.lines.find((l) => l.code === "STATE_SALES");
    // No MRE → sales base is subtotal alone = 5000. 6% = 300.
    expect(sales!.amountCents).toBe(300);
    expect(r.breakdown.totalTaxCents).toBe(300);
  });

  it("empty MI cart returns zero subtotal + zero tax", () => {
    const r = computeTaxBreakdown(miAdultCart([]));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.breakdown.subtotalCents).toBe(0);
      expect(r.breakdown.totalTaxCents).toBe(0);
      expect(r.breakdown.lines).toHaveLength(0);
    }
  });

  it("ruleset version is carried through the breakdown", () => {
    const r = computeTaxBreakdown(miAdultCart([flowerLine(1000)]));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.breakdown.rulesetVersion).toBe("mi-2026.05.14");
  });
});

describe("IL tax engine (round-2 B4) — tiered excise + ROT", () => {
  it("$100 flower adult-use, THC 20% (≤35%): 10% excise + 6.25% ROT", () => {
    const r = computeTaxBreakdown(ilResCart([flowerLine(10000, 1, 20)]));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const excise = r.breakdown.lines.find((l) => l.code === "STATE_EXCISE");
    expect(excise!.amountCents).toBe(1000); // 10% of 100
    const sales = r.breakdown.lines.find((l) => l.code === "STATE_SALES");
    expect(sales!.amountCents).toBe(625); // 6.25% of 100
    expect(r.breakdown.totalTaxCents).toBe(1625);
  });

  it("$100 flower adult-use, THC 36% (>35%): 25% excise + 6.25% ROT", () => {
    const r = computeTaxBreakdown(ilResCart([flowerLine(10000, 1, 36)]));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const excise = r.breakdown.lines.find((l) => l.code === "STATE_EXCISE");
    expect(excise!.amountCents).toBe(2500); // 25%
  });

  it("$100 infused adult-use: 20% excise (no THC condition needed) + 6.25% ROT", () => {
    const r = computeTaxBreakdown(ilResCart([infusedLine(10000)]));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const excise = r.breakdown.lines.find((l) => l.code === "STATE_EXCISE");
    expect(excise!.amountCents).toBe(2000); // 20%
    const sales = r.breakdown.lines.find((l) => l.code === "STATE_SALES");
    expect(sales!.amountCents).toBe(625);
  });

  it("flower line WITHOUT adjustedThcPct refuses with TAX_INPUT_MISSING", () => {
    const r = computeTaxBreakdown(ilResCart([flowerLine(5000)]));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reason.code).toBe("TAX_INPUT_MISSING");
      if (r.reason.code === "TAX_INPUT_MISSING") {
        expect(r.reason.missingField).toBe("adjustedThcPct");
      }
    }
  });

  it("IL medical patient exempt from excise, gets 1% ROT instead of 6.25%", () => {
    const r = computeTaxBreakdown(ilMedCart([flowerLine(10000, 1, 20)]));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const excise = r.breakdown.lines.find((l) => l.code === "STATE_EXCISE");
    expect(excise).toBeUndefined();
    const sales = r.breakdown.lines.find((l) => l.code === "STATE_SALES");
    expect(sales!.amountCents).toBe(100); // 1% of 10000
    expect(sales!.label).toContain("Medical");
  });

  it("THC threshold is inclusive on the lower side (35% gets 10%, 35.01% gets 25%)", () => {
    const at = computeTaxBreakdown(ilResCart([flowerLine(10000, 1, 35)]));
    expect(at.ok).toBe(true);
    if (at.ok) {
      const e = at.breakdown.lines.find((l) => l.code === "STATE_EXCISE");
      expect(e!.amountCents).toBe(1000); // 10% — 35.0 is ≤35
    }
    const over = computeTaxBreakdown(ilResCart([flowerLine(10000, 1, 35.01)]));
    expect(over.ok).toBe(true);
    if (over.ok) {
      const e = over.breakdown.lines.find((l) => l.code === "STATE_EXCISE");
      expect(e!.amountCents).toBe(2500); // 25% of 10000
    }
  });

  it("mixed cart: flower (THC 25%) + infused — excise rates differ per line", () => {
    const r = computeTaxBreakdown(
      ilResCart([flowerLine(10000, 1, 25), infusedLine(5000)]),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    // Two excise lines emitted (10% on flower + 20% on infused).
    // Actually: rates are evaluated separately, but tax-line aggregation
    // puts each rate in its own row (one row per rate that produced > 0).
    // 10% excise: 1000 (flower only); 20% excise: 1000 (infused only).
    const exciseTotal = r.breakdown.lines
      .filter((l) => l.code === "STATE_EXCISE")
      .reduce((a, l) => a + l.amountCents, 0);
    expect(exciseTotal).toBe(2000); // 1000 + 1000
    const sales = r.breakdown.lines.find((l) => l.code === "STATE_SALES");
    expect(sales!.amountCents).toBe(938); // 6.25% of 15000 = 937.5 → 938
  });
});

describe("Local taxes (per-tenant config in cart.localTaxes)", () => {
  it("a 3% local cannabis tax stacks additively after ruleset rates", () => {
    const localRate: TaxRate = {
      code: "LOCAL",
      label: "Ann Arbor Cannabis Tax",
      rate: 0.03,
      base: "SUBTOTAL",
    };
    const cart: Cart = {
      ...miAdultCart([flowerLine(10000)]),
      localTaxes: [localRate],
    };
    const r = computeTaxBreakdown(cart);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const local = r.breakdown.lines.find((l) => l.code === "LOCAL");
    expect(local!.amountCents).toBe(300); // 3% of 10000
  });

  it("local tax is not included in SUBTOTAL_PLUS_PRIOR_STATE_TAX base (only state taxes are)", () => {
    // Order matters: state-excise → state-sales → local. The local rate
    // computed on SUBTOTAL doesn't influence the sales tax base.
    const localRate: TaxRate = {
      code: "LOCAL",
      label: "Local",
      rate: 0.03,
      base: "SUBTOTAL",
    };
    const cart: Cart = {
      ...miAdultCart([flowerLine(10000)]),
      localTaxes: [localRate],
    };
    const r = computeTaxBreakdown(cart);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const sales = r.breakdown.lines.find((l) => l.code === "STATE_SALES");
    // Sales = 6% of (10000 + 1000 MRE) = 660. Not 660 + 18 (from local).
    expect(sales!.amountCents).toBe(660);
  });
});

describe("computeTaxes via the kernel facade", () => {
  const kernel = makeKernel({ requireRulesetStatus: "secondary-cite-only" });

  it("returns ok with breakdown for MI adult-use sale", () => {
    const r = kernel.computeTaxes(miAdultCart([flowerLine(5000)]));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.taxes.grandTotalCents).toBe(5830);
    }
  });

  it("refuses if the ruleset threshold blocks loading", () => {
    const k = makeKernel({ requireRulesetStatus: "counsel-verified" });
    const r = k.computeTaxes(miAdultCart([flowerLine(1000)]));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason.code).toBe("RULESET_INSUFFICIENT_VERIFICATION");
  });
});
