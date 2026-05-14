import { describe, it, expect } from "vitest";
import { encodeReceiptToEscPos } from "../esc-pos-encoder";
import type { ReceiptContent } from "@tend-o-matic/compliance";

function sampleReceipt(): ReceiptContent {
  return {
    rulesetVersion: "mi-2026.05.14",
    header: ["Demo MI Dispensary", "123 Main St", "License: AU-R-000123"],
    customerBlock: ["Adult-use sale — age verified"],
    lines: [
      {
        description: "FLOWER (3.5G)",
        qty: 1,
        unitPriceCents: 5000,
        lineTotalCents: 5000,
      },
    ],
    taxLines: [{ label: "MI MRE", amountCents: 500 }],
    totals: { subtotalCents: 5000, taxCents: 830, totalCents: 5830 },
    footer: ["CASH: $58.30"],
  };
}

describe("encodeReceiptToEscPos", () => {
  it("starts with the ESC @ init sequence", () => {
    const bytes = encodeReceiptToEscPos(sampleReceipt());
    expect(bytes[0]).toBe(0x1b);
    expect(bytes[1]).toBe(0x40);
  });

  it("includes the store-name header text", () => {
    const bytes = encodeReceiptToEscPos(sampleReceipt());
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain("Demo MI Dispensary");
    expect(text).toContain("123 Main St");
  });

  it("emits a TOTAL line with the grand total cents", () => {
    const bytes = encodeReceiptToEscPos(sampleReceipt());
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain("TOTAL");
    expect(text).toContain("$58.30");
  });

  it("includes per-line tax components when present", () => {
    const receipt: ReceiptContent = {
      ...sampleReceipt(),
      lines: [
        {
          description: "FLOWER (3.5G)",
          qty: 1,
          unitPriceCents: 5000,
          lineTotalCents: 5000,
          taxes: [{ label: "MI MRE", amountCents: 500 }],
        },
      ],
    };
    const bytes = encodeReceiptToEscPos(receipt);
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain("+ MI MRE");
  });

  it("ends with a partial cut command by default (GS V 0x01)", () => {
    const bytes = encodeReceiptToEscPos(sampleReceipt());
    // GS V 1 = 0x1d 0x56 0x01
    let foundCut = false;
    for (let i = 0; i < bytes.length - 2; i++) {
      if (bytes[i] === 0x1d && bytes[i + 1] === 0x56 && bytes[i + 2] === 0x01) {
        foundCut = true;
        break;
      }
    }
    expect(foundCut).toBe(true);
  });

  it("omits cut when options.cut = 'none'", () => {
    const bytes = encodeReceiptToEscPos(sampleReceipt(), { cut: "none" });
    let foundCut = false;
    for (let i = 0; i < bytes.length - 2; i++) {
      if (bytes[i] === 0x1d && bytes[i + 1] === 0x56) {
        foundCut = true;
        break;
      }
    }
    expect(foundCut).toBe(false);
  });

  it("emits the drawer-kick DK1 pulse when openDrawer = true", () => {
    const bytes = encodeReceiptToEscPos(sampleReceipt(), { openDrawer: true });
    // ESC p 0 m t = 0x1b 0x70 0x00 ...
    let found = false;
    for (let i = 0; i < bytes.length - 4; i++) {
      if (
        bytes[i] === 0x1b &&
        bytes[i + 1] === 0x70 &&
        bytes[i + 2] === 0x00
      ) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it("does not emit drawer kick when openDrawer is omitted", () => {
    const bytes = encodeReceiptToEscPos(sampleReceipt());
    let found = false;
    for (let i = 0; i < bytes.length - 4; i++) {
      if (
        bytes[i] === 0x1b &&
        bytes[i + 1] === 0x70 &&
        bytes[i + 2] === 0x00
      ) {
        found = true;
        break;
      }
    }
    expect(found).toBe(false);
  });

  it("replaces non-ASCII characters with '?' (CP-translation TODO)", () => {
    const receipt: ReceiptContent = {
      ...sampleReceipt(),
      header: ["Café Smith — ✓"],
    };
    const bytes = encodeReceiptToEscPos(receipt);
    const text = new TextDecoder().decode(bytes);
    // 'é' (0xe9), em-dash (0x2014), check (0x2713) become '?'
    expect(text).toContain("Caf?");
    expect(text).not.toContain("é");
    expect(text).not.toContain("—");
    expect(text).not.toContain("✓");
  });
});
