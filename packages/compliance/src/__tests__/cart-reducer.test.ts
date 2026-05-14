import { describe, it, expect } from "vitest";
import { makeKernel } from "../kernel";
import { reduce, applyAll, openCart } from "../cart-reducer";
import { MI_2026_05_14, IL_2026_05_14 } from "../rulesets";
import type { LineItem } from "../cart";

const kernel = makeKernel({ requireRulesetStatus: "secondary-cite-only" });

function flower(g: number, pkg = "p1"): LineItem {
  return {
    packageId: pkg,
    category: "FLOWER",
    weight: { value: g, unit: "G" },
    unitPriceCents: 5000,
    qty: 1,
    tested: true,
    labeled: true,
    recalled: false,
  };
}

describe("openCart", () => {
  it("constructs a fresh cart with sensible defaults", () => {
    const c = openCart({
      tenantId: "t1",
      locationId: "loc1",
      customer: { kind: "MI_ADULT_USE" },
      ruleset: MI_2026_05_14,
    });
    expect(c.lines).toEqual([]);
    expect(c.idVerified).toBe(false);
    expect(c.localTaxes).toBeUndefined();
    expect(c.openedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("respects explicit overrides", () => {
    const c = openCart({
      tenantId: "t1",
      locationId: "loc1",
      customer: { kind: "MI_ADULT_USE" },
      ruleset: MI_2026_05_14,
      idVerified: true,
      openedAt: "2026-05-14T10:00:00Z",
    });
    expect(c.idVerified).toBe(true);
    expect(c.openedAt).toBe("2026-05-14T10:00:00Z");
  });

  it("defaults serviceMode to GUIDED", () => {
    const c = openCart({
      tenantId: "t1",
      locationId: "loc1",
      customer: { kind: "MI_ADULT_USE" },
      ruleset: MI_2026_05_14,
    });
    expect(c.serviceMode).toBe("GUIDED");
  });

  it("respects serviceMode override at open time", () => {
    const c = openCart({
      tenantId: "t1",
      locationId: "loc1",
      customer: { kind: "MI_ADULT_USE" },
      ruleset: MI_2026_05_14,
      serviceMode: "EXPRESS",
    });
    expect(c.serviceMode).toBe("EXPRESS");
  });
});

describe("reduce — SET_SERVICE_MODE", () => {
  it("flips serviceMode and never errors", () => {
    const c0 = openCart({
      tenantId: "t1",
      locationId: "loc1",
      customer: { kind: "MI_ADULT_USE" },
      ruleset: MI_2026_05_14,
    });
    const r = reduce(c0, { type: "SET_SERVICE_MODE", serviceMode: "EXPRESS" }, kernel);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.cart.serviceMode).toBe("EXPRESS");
  });

  it("preserves existing lines + customer state when mode changes mid-cart", () => {
    const c0 = openCart({
      tenantId: "t1",
      locationId: "loc1",
      customer: { kind: "MI_ADULT_USE" },
      ruleset: MI_2026_05_14,
      idVerified: true,
    });
    const withLine = reduce(c0, { type: "ADD_LINE", line: flower(3.5) }, kernel);
    expect(withLine.ok).toBe(true);
    if (!withLine.ok) return;
    const flipped = reduce(
      withLine.cart,
      { type: "SET_SERVICE_MODE", serviceMode: "MEDICAL_SENSITIVE" },
      kernel,
    );
    expect(flipped.ok).toBe(true);
    if (!flipped.ok) return;
    expect(flipped.cart.lines).toHaveLength(1);
    expect(flipped.cart.serviceMode).toBe("MEDICAL_SENSITIVE");
    expect(flipped.cart.idVerified).toBe(true);
  });
});

describe("reduce — ADD_LINE", () => {
  it("delegates to kernel.applyLineItem and returns the new cart on success", () => {
    const c0 = openCart({
      tenantId: "t1",
      locationId: "loc1",
      customer: { kind: "MI_ADULT_USE" },
      ruleset: MI_2026_05_14,
      idVerified: true,
    });
    const r = reduce(c0, { type: "ADD_LINE", line: flower(3.5) }, kernel);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.cart.lines).toHaveLength(1);
  });

  it("propagates a kernel refusal", () => {
    const c0 = openCart({
      tenantId: "t1",
      locationId: "loc1",
      customer: { kind: "MI_ADULT_USE" },
      ruleset: MI_2026_05_14,
      idVerified: false, // adult-use needs ID; this should refuse
    });
    const r = reduce(c0, { type: "ADD_LINE", line: flower(3.5) }, kernel);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason.code).toBe("ID_NOT_VERIFIED");
  });
});

describe("reduce — REMOVE_LINE", () => {
  it("removes a line by packageId; other lines remain", () => {
    const c0 = openCart({
      tenantId: "t1",
      locationId: "loc1",
      customer: { kind: "MI_ADULT_USE" },
      ruleset: MI_2026_05_14,
      idVerified: true,
    });
    const c1 = reduce(c0, { type: "ADD_LINE", line: flower(3.5, "a") }, kernel);
    expect(c1.ok).toBe(true);
    if (!c1.ok) return;
    const c2 = reduce(c1.cart, { type: "ADD_LINE", line: flower(7, "b") }, kernel);
    expect(c2.ok).toBe(true);
    if (!c2.ok) return;
    const c3 = reduce(c2.cart, { type: "REMOVE_LINE", packageId: "a" }, kernel);
    expect(c3.ok).toBe(true);
    if (!c3.ok) return;
    expect(c3.cart.lines).toHaveLength(1);
    expect(c3.cart.lines[0]!.packageId).toBe("b");
  });

  it("is a no-op for a non-existent packageId", () => {
    const c0 = openCart({
      tenantId: "t1",
      locationId: "loc1",
      customer: { kind: "MI_ADULT_USE" },
      ruleset: MI_2026_05_14,
      idVerified: true,
    });
    const r = reduce(c0, { type: "REMOVE_LINE", packageId: "ghost" }, kernel);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.cart.lines).toEqual([]);
  });
});

describe("reduce — SET_CUSTOMER / SET_ID_VERIFIED / SET_LOCAL_TAXES", () => {
  it("SET_CUSTOMER swaps customer without re-validating existing lines", () => {
    const c0 = openCart({
      tenantId: "t1",
      locationId: "loc1",
      customer: { kind: "MI_ADULT_USE" },
      ruleset: MI_2026_05_14,
      idVerified: true,
    });
    const r = reduce(
      c0,
      { type: "SET_CUSTOMER", customer: { kind: "MI_MED_PATIENT", registryIdHash: "h1" } },
      kernel,
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.cart.customer.kind).toBe("MI_MED_PATIENT");
  });

  it("SET_ID_VERIFIED toggles the flag", () => {
    const c0 = openCart({
      tenantId: "t1",
      locationId: "loc1",
      customer: { kind: "MI_ADULT_USE" },
      ruleset: MI_2026_05_14,
    });
    const r = reduce(c0, { type: "SET_ID_VERIFIED", idVerified: true }, kernel);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.cart.idVerified).toBe(true);
  });

  it("SET_LOCAL_TAXES attaches a per-tenant local tax rate", () => {
    const c0 = openCart({
      tenantId: "t1",
      locationId: "loc1",
      customer: { kind: "MI_ADULT_USE" },
      ruleset: MI_2026_05_14,
    });
    const r = reduce(
      c0,
      {
        type: "SET_LOCAL_TAXES",
        localTaxes: [
          {
            code: "LOCAL",
            label: "City of Ann Arbor",
            rate: 0.03,
            base: "SUBTOTAL",
          },
        ],
      },
      kernel,
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.cart.localTaxes).toHaveLength(1);
  });
});

describe("applyAll — sequence fold with first-refusal stop", () => {
  it("rolls through a full open → verify ID → add line → checkout-ready flow", () => {
    const c0 = openCart({
      tenantId: "t1",
      locationId: "loc1",
      customer: { kind: "IL_ADULT_USE_RESIDENT" },
      ruleset: IL_2026_05_14,
    });
    const r = applyAll(
      c0,
      [
        { type: "SET_ID_VERIFIED", idVerified: true },
        {
          type: "ADD_LINE",
          line: {
            ...flower(15, "il-1"),
            adjustedThcPct: 22,
          },
        },
        {
          type: "ADD_LINE",
          line: {
            ...flower(10, "il-2"),
            adjustedThcPct: 22,
          },
        },
      ],
      kernel,
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.cart.lines).toHaveLength(2);
  });

  it("stops at the first refusal, reporting the failed action index", () => {
    const c0 = openCart({
      tenantId: "t1",
      locationId: "loc1",
      customer: { kind: "MI_ADULT_USE" },
      ruleset: MI_2026_05_14,
      idVerified: true,
    });
    const r = applyAll(
      c0,
      [
        { type: "ADD_LINE", line: flower(60, "a") }, // ~2.12 oz, ok
        { type: "ADD_LINE", line: flower(20, "b") }, // pushes >2.5 oz, refused
      ],
      kernel,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.failedActionIndex).toBe(1);
      expect(r.reason.code).toBe("LIMIT_EXCEEDED");
    }
  });
});
