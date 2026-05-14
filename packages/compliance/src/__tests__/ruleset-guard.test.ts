import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { makeKernel } from "../kernel";
import { MI_2026_05_14, IL_2026_05_14 } from "../rulesets";
import type { Cart, LineItem } from "../cart";
import type { CustomerType } from "../customer";

function baseCartMI(): Cart {
  return {
    tenantId: "t1",
    locationId: "l1",
    customer: { kind: "MI_ADULT_USE" },
    ruleset: MI_2026_05_14,
    lines: [],
    openedAt: "2026-05-14T10:00:00Z",
    idVerified: true,
  };
}

function line(over: Partial<LineItem> = {}): LineItem {
  return {
    packageId: "pkg-1",
    category: "FLOWER",
    weight: { value: 3.5, unit: "G" },
    unitPriceCents: 4000,
    qty: 1,
    tested: true,
    labeled: true,
    recalled: false,
    ...over,
  };
}

describe("kernel ruleset verification guard", () => {
  it("refuses any line item under a counsel-verified threshold when the ruleset is secondary-cite-only", () => {
    const kernel = makeKernel({ requireRulesetStatus: "counsel-verified" });
    const result = kernel.applyLineItem(baseCartMI(), line());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason.code).toBe("RULESET_INSUFFICIENT_VERIFICATION");
    }
  });

  it("refuses computeTaxes universally in v0.1 because tax block is TODO", () => {
    const kernel = makeKernel({ requireRulesetStatus: "secondary-cite-only" });
    const result = kernel.computeTaxes(baseCartMI());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason.code).toBe("RULESET_INSUFFICIENT_VERIFICATION");
    }
  });

  it("refuses renderReceipt universally in v0.1 because receipt block is TODO", () => {
    const kernel = makeKernel({ requireRulesetStatus: "secondary-cite-only" });
    const result = kernel.renderReceipt(baseCartMI());
    expect(result.ok).toBe(false);
  });
});

describe("product eligibility guards", () => {
  const kernel = makeKernel({ requireRulesetStatus: "secondary-cite-only" });

  it("refuses untested product", () => {
    const r = kernel.applyLineItem(baseCartMI(), line({ tested: false }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason.code).toBe("PRODUCT_NOT_TESTED");
  });

  it("refuses unlabeled product", () => {
    const r = kernel.applyLineItem(baseCartMI(), line({ labeled: false }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason.code).toBe("PRODUCT_NOT_LABELED");
  });

  it("refuses recalled product", () => {
    const r = kernel.applyLineItem(baseCartMI(), line({ recalled: true }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason.code).toBe("PRODUCT_RECALLED");
  });

  it("refuses adult-use sale when ID is not verified", () => {
    const cart = baseCartMI();
    const r = kernel.applyLineItem({ ...cart, idVerified: false }, line());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason.code).toBe("ID_NOT_VERIFIED");
  });
});

describe("jurisdiction mismatch guard", () => {
  const kernel = makeKernel({ requireRulesetStatus: "secondary-cite-only" });

  it("refuses an IL customer against a MI ruleset", () => {
    const cart: Cart = {
      ...baseCartMI(),
      customer: { kind: "IL_ADULT_USE_RESIDENT" },
    };
    const r = kernel.applyLineItem(cart, line());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason.code).toBe("JURISDICTION_MISMATCH");
  });

  it("property: every IL customer is refused under the MI ruleset", () => {
    fc.assert(
      fc.property(
        fc.constantFrom<CustomerType["kind"]>(
          "IL_ADULT_USE_RESIDENT",
          "IL_ADULT_USE_NONRESIDENT",
        ),
        (kind) => {
          const cart: Cart = {
            ...baseCartMI(),
            customer: { kind },
          };
          const r = kernel.applyLineItem(cart, line());
          return !r.ok && r.reason.code === "JURISDICTION_MISMATCH";
        },
      ),
      { numRuns: 20 },
    );
  });
});

describe("equivalency guard", () => {
  const kernel = makeKernel({ requireRulesetStatus: "secondary-cite-only" });

  it("refuses any line item because the MI fixture has no populated equivalencies", () => {
    const r = kernel.applyLineItem(baseCartMI(), line({ category: "FLOWER" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason.code).toBe("EQUIVALENCY_UNDEFINED");
  });
});

describe("ruleset registry", () => {
  it("MI fixture has every required customer kind", () => {
    expect(MI_2026_05_14.customerKinds).toContain("MI_ADULT_USE");
    expect(MI_2026_05_14.customerKinds).toContain("MI_MED_PATIENT");
    expect(MI_2026_05_14.customerKinds).toContain("MI_MED_CAREGIVER");
  });

  it("IL fixture encodes the resident/non-resident split", () => {
    expect(IL_2026_05_14.customerKinds).toContain("IL_ADULT_USE_RESIDENT");
    expect(IL_2026_05_14.customerKinds).toContain("IL_ADULT_USE_NONRESIDENT");
  });
});
