import { describe, it, expect } from "vitest";
import { MI_2026_05_14, IL_2026_05_14 } from "../rulesets";

describe("MI receipt block (round-2 A5)", () => {
  const block = MI_2026_05_14.receiptBlock!;

  it("is present", () => {
    expect(block).not.toBeNull();
  });

  it("requires the core line-item + totals fields", () => {
    const required = new Set(
      block.requirements.filter((r) => r.required).map((r) => r.field),
    );
    for (const f of [
      "STORE_NAME",
      "STORE_ADDRESS",
      "LICENSE_NUMBER",
      "DATETIME",
      "RECEIPT_ID",
      "ITEM_DESCRIPTION",
      "ITEM_QTY",
      "ITEM_UNIT_PRICE",
      "ITEM_LINE_TOTAL",
      "SUBTOTAL",
      "TAX_TOTAL_AGGREGATE",
      "GRAND_TOTAL",
      "TENDER_TYPE",
      "TENDER_AMOUNT",
    ] as const) {
      expect(required.has(f)).toBe(true);
    }
  });

  it("documents MCL 333.27958 PII restriction in notes", () => {
    const joined = block.notes.join(" ");
    expect(joined).toMatch(/PII|registry/i);
    expect(joined).toMatch(/333\.27958/);
  });

  it("provenance is secondary-cite-only (MCL citation indirect)", () => {
    expect(block.provenance.status).toBe("secondary-cite-only");
  });
});

describe("IL receipt block (round-2 B5)", () => {
  const block = IL_2026_05_14.receiptBlock!;

  it("requires per-line tax breakdown (CRTA transaction-data definition)", () => {
    const r = block.requirements.find(
      (x) => x.field === "ITEM_TAX_BREAKDOWN_PER_LINE",
    );
    expect(r?.required).toBe(true);
  });

  it("documents CRTA §65-38 zapper-felony immutability requirement", () => {
    const joined = block.notes.join(" ");
    expect(joined).toMatch(/65-38|zapper|sales suppression/i);
  });

  it("provenance is agency-confirmed (statute cited directly)", () => {
    expect(block.provenance.status).toBe("agency-confirmed");
  });
});

describe("MI returns policy (round-2 A6 → R. 420.214c)", () => {
  const policy = MI_2026_05_14.returnsPolicy!;

  it("permits ADVERSE_REACTION, DEFECTIVE, RECALL only", () => {
    expect([...policy.permittedScenarios].sort()).toEqual(
      ["ADVERSE_REACTION", "DEFECTIVE", "RECALL"].sort(),
    );
  });

  it("forbids resale of returned product", () => {
    expect(policy.mayResell).toBe(false);
  });

  it("requires destruction within 90 days", () => {
    expect(policy.destroyWithinDays).toBe(90);
  });

  it("prohibits delivery-driver returns", () => {
    expect(policy.driverAcceptsReturns).toBe(false);
  });

  it("provenance is agency-confirmed (admin code cited)", () => {
    expect(policy.provenance.status).toBe("agency-confirmed");
  });
});

describe("IL returns policy (round-2 B6 → 1291.320)", () => {
  const policy = IL_2026_05_14.returnsPolicy!;

  it("requires SVS entry within 5 days", () => {
    expect(policy.externalReportWithinDays).toBe(5);
  });

  it("forbids resale", () => {
    expect(policy.mayResell).toBe(false);
  });

  it("documents seal-broken / left-premises bar to resale", () => {
    const joined = policy.notes.join(" ");
    expect(joined).toMatch(/seal|premises/i);
  });

  it("provenance is agency-confirmed", () => {
    expect(policy.provenance.status).toBe("agency-confirmed");
  });
});

describe("MI recalls policy (round-2 A10 → R. 420.214b + Bulletin 49)", () => {
  const policy = MI_2026_05_14.recallsPolicy!;

  it("notifies CRA within 24 hours (1 business day)", () => {
    expect(policy.notifyRegulatorsWithinHours).toBe(24);
    expect(policy.notifyAgencies).toEqual(["CRA"]);
  });

  it("requires Metrc 'Patient' menu for adverse-event submissions (non-obvious)", () => {
    expect(policy.metrcAdverseEventMenu).toBe("Patient");
  });

  it("requires pre-sale hold-check on every transaction", () => {
    expect(policy.preSaleHoldCheckRequired).toBe(true);
  });

  it("requires Metrc entry before destruction (90-day destroy window)", () => {
    expect(policy.systemEntryRequiredBeforeDestruction).toBe(true);
    expect(policy.destroyWithinDays).toBe(90);
  });
});

describe("IL recalls policy (round-2 B6 → 1291.330)", () => {
  const policy = IL_2026_05_14.recallsPolicy!;

  it("notifies three agencies within 24 hours: IDFPR + IDOA + DPH", () => {
    expect(policy.notifyRegulatorsWithinHours).toBe(24);
    expect([...policy.notifyAgencies].sort()).toEqual(["DPH", "IDFPR", "IDOA"]);
  });

  it("requires 72-hour minimum quarantine", () => {
    expect(policy.quarantineMinHours).toBe(72);
  });

  it("requires SVS entry before destruction", () => {
    expect(policy.systemEntryRequiredBeforeDestruction).toBe(true);
  });

  it("does NOT use Metrc Patient-menu workflow (IL recalls flow via SVS)", () => {
    expect(policy.metrcAdverseEventMenu).toBeNull();
  });
});
