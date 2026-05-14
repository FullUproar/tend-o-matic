import { describe, it, expect } from "vitest";
import { renderReceipt, formatReceiptAsText, type ReceiptContext } from "../receipt-renderer";
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

function flowerLine(price: number): LineItem {
  return {
    packageId: "pkg-1",
    category: "FLOWER",
    weight: { value: 3.5, unit: "G" },
    unitPriceCents: price,
    qty: 1,
    tested: true,
    labeled: true,
    recalled: false,
  };
}

function baseContext(): ReceiptContext {
  return {
    store: {
      name: "Tend-O-Matic Demo Store",
      address: ["123 Main St", "Ann Arbor, MI 48104"],
      licenseNumber: "AU-R-000123",
    },
    sale: {
      id: "00000000-0000-4000-8000-000000000001",
      receiptId: "R-0001",
      completedAt: "2026-05-14T10:30:00Z",
      cashierName: "Sample Cashier",
      cashierUserId: "00000000-0000-4000-8000-000000000099",
    },
    tenders: [{ tenderType: "CASH", amountCents: 6000 }],
    changeDueCents: 170,
  };
}

describe("renderReceipt — happy path", () => {
  it("MI adult-use $50 sale renders all sections", () => {
    const cart = miAdultCart([flowerLine(5000)]);
    const tax = computeTaxBreakdown(cart);
    expect(tax.ok).toBe(true);
    if (!tax.ok) return;
    const r = renderReceipt(cart, tax.breakdown, baseContext());
    expect(r.ok).toBe(true);
    if (!r.ok) return;

    expect(r.receipt.header).toContain("Tend-O-Matic Demo Store");
    expect(r.receipt.header.some((l) => l.includes("License"))).toBe(true);
    expect(r.receipt.customerBlock[0]).toMatch(/Adult-use/);
    expect(r.receipt.lines).toHaveLength(1);
    expect(r.receipt.lines[0]!.description).toBe("FLOWER (3.5G)");
    expect(r.receipt.taxLines.length).toBeGreaterThan(0);
    expect(r.receipt.totals.subtotalCents).toBe(5000);
    expect(r.receipt.totals.taxCents).toBe(830);
    expect(r.receipt.totals.totalCents).toBe(5830);
    expect(r.receipt.footer.some((l) => l.includes("CASH"))).toBe(true);
    expect(r.receipt.footer.some((l) => l.includes("Change"))).toBe(true);
    expect(r.receipt.footer.some((l) => l.includes("Ruleset"))).toBe(true);
  });

  it("medical sale labels customerBlock and masks the registry hash", () => {
    const cart: Cart = {
      ...miAdultCart([flowerLine(5000)]),
      customer: { kind: "MI_MED_PATIENT", registryIdHash: "abcdef1234567890" },
    };
    // Medical refuses at the kernel (LIMIT_WINDOW_NOT_IMPLEMENTED), so
    // we test the renderer in isolation by computing tax + receipt
    // directly. (In a real flow the kernel won't have approved the cart.)
    const tax = computeTaxBreakdown(cart);
    expect(tax.ok).toBe(true);
    if (!tax.ok) return;
    const r = renderReceipt(cart, tax.breakdown, baseContext());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.receipt.customerBlock.some((l) => l.includes("Medical"))).toBe(true);
    expect(r.receipt.customerBlock.some((l) => l.includes("abcd"))).toBe(true);
    expect(r.receipt.customerBlock.some((l) => l.includes("abcdef1234567890"))).toBe(false);
  });

  it("change of 0 is not printed in the footer", () => {
    const cart = miAdultCart([flowerLine(5000)]);
    const tax = computeTaxBreakdown(cart);
    if (!tax.ok) return;
    const ctx = baseContext();
    ctx.tenders = [{ tenderType: "CASH", amountCents: 5830 }];
    ctx.changeDueCents = 0;
    const r = renderReceipt(cart, tax.breakdown, ctx);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.receipt.footer.some((l) => l.startsWith("Change"))).toBe(false);
    }
  });
});

describe("renderReceipt — required-field validation", () => {
  it("refuses when STORE_NAME is empty (MI fixture requires it)", () => {
    const cart = miAdultCart([flowerLine(5000)]);
    const tax = computeTaxBreakdown(cart);
    if (!tax.ok) return;
    const ctx = baseContext();
    ctx.store.name = "";
    const r = renderReceipt(cart, tax.breakdown, ctx);
    expect(r.ok).toBe(false);
    if (!r.ok && r.reason.code === "TAX_INPUT_MISSING") {
      expect(r.reason.missingField).toBe("receipt.STORE_NAME");
    }
  });

  it("refuses when CHANGE_DUE is NaN", () => {
    const cart = miAdultCart([flowerLine(5000)]);
    const tax = computeTaxBreakdown(cart);
    if (!tax.ok) return;
    const ctx = baseContext();
    ctx.changeDueCents = Number.NaN;
    const r = renderReceipt(cart, tax.breakdown, ctx);
    expect(r.ok).toBe(false);
  });

  it("IL renderer emits per-line tax attribution (CRTA segregation requirement)", () => {
    const ilCart: Cart = {
      tenantId: "t1",
      locationId: "l1",
      customer: { kind: "IL_ADULT_USE_RESIDENT" },
      ruleset: IL_2026_05_14,
      lines: [{ ...flowerLine(5000), adjustedThcPct: 20 }],
      openedAt: "2026-05-14T10:00:00Z",
      idVerified: true,
    };
    const tax = computeTaxBreakdown(ilCart);
    expect(tax.ok).toBe(true);
    if (!tax.ok) return;
    const r = renderReceipt(ilCart, tax.breakdown, baseContext());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.receipt.lines).toHaveLength(1);
    // The single line should carry per-line tax components: excise + ROT.
    const line = r.receipt.lines[0]!;
    expect(line.taxes).toBeDefined();
    expect(line.taxes!.length).toBeGreaterThanOrEqual(2);
    const codes = line.taxes!.map((t) => t.label);
    expect(codes.some((c) => /Excise/i.test(c))).toBe(true);
    expect(codes.some((c) => /ROT/i.test(c))).toBe(true);
    // Sum of per-line taxes equals total tax (single-line cart, no rounding split).
    const sum = line.taxes!.reduce((a, t) => a + t.amountCents, 0);
    expect(sum).toBe(r.receipt.totals.taxCents);
  });
});

describe("formatReceiptAsText", () => {
  it("emits a monospace string with sections separated by dashes", () => {
    const cart = miAdultCart([flowerLine(5000)]);
    const tax = computeTaxBreakdown(cart);
    if (!tax.ok) return;
    const r = renderReceipt(cart, tax.breakdown, baseContext());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const text = formatReceiptAsText(r.receipt);
    expect(text).toContain("Tend-O-Matic Demo Store");
    expect(text).toContain("TOTAL");
    expect(text).toContain("$58.30");
    expect(text).toContain("Ruleset: mi-2026.05.14");
    // Sections separated by --- lines.
    const sepLines = text.split("\n").filter((l) => /^-+$/.test(l));
    expect(sepLines.length).toBeGreaterThanOrEqual(3);
  });

  it("respects custom width", () => {
    const cart = miAdultCart([flowerLine(5000)]);
    const tax = computeTaxBreakdown(cart);
    if (!tax.ok) return;
    const r = renderReceipt(cart, tax.breakdown, baseContext());
    if (!r.ok) return;
    const narrow = formatReceiptAsText(r.receipt, 30);
    const wide = formatReceiptAsText(r.receipt, 60);
    expect(wide).not.toBe(narrow);
    const wideSepLine = wide.split("\n").find((l) => /^-+$/.test(l));
    expect(wideSepLine?.length).toBe(60);
  });
});
