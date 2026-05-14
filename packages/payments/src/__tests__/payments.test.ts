import { describe, it, expect } from "vitest";
import { CashProvider } from "../cash-provider";
import {
  NotImplementedCashlessAtmProvider,
  NotImplementedAchProvider,
} from "../not-implemented-providers";
import { PaymentRegistry } from "../registry";

describe("CashProvider", () => {
  const cash = new CashProvider();

  it("charges always succeed with a unique providerRef + ISO timestamp", async () => {
    const a = await cash.charge({
      saleId: "s1",
      tenantId: "t1",
      amountCents: 5830,
      idempotencyKey: "i1",
    });
    expect(a.ok).toBe(true);
    if (a.ok) {
      expect(a.providerRef).toMatch(/^cash-[0-9a-f-]{36}$/);
      expect(a.capturedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }
  });

  it("refuses non-positive amounts with retryable=false", async () => {
    const r = await cash.charge({
      saleId: "s1",
      tenantId: "t1",
      amountCents: 0,
      idempotencyKey: "i1",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.retryable).toBe(false);
      expect(r.error).toMatch(/amountCents must be > 0/);
    }
  });

  it("returns a different providerRef on each successful call", async () => {
    const a = await cash.charge({
      saleId: "s1",
      tenantId: "t1",
      amountCents: 100,
      idempotencyKey: "i1",
    });
    const b = await cash.charge({
      saleId: "s2",
      tenantId: "t1",
      amountCents: 100,
      idempotencyKey: "i2",
    });
    if (a.ok && b.ok) {
      expect(a.providerRef).not.toBe(b.providerRef);
    }
  });
});

describe("NotImplementedCashlessAtmProvider", () => {
  it("refuses with retryable=false and references Aeropay/Paybotic/KindPay", async () => {
    const p = new NotImplementedCashlessAtmProvider();
    const r = await p.charge({
      saleId: "s",
      tenantId: "t",
      amountCents: 1000,
      idempotencyKey: "k",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.retryable).toBe(false);
      expect(r.error).toMatch(/Aeropay|Paybotic|KindPay/);
    }
  });
});

describe("NotImplementedAchProvider", () => {
  it("refuses with retryable=false and references Safe Harbor Financial", async () => {
    const p = new NotImplementedAchProvider();
    const r = await p.charge({
      saleId: "s",
      tenantId: "t",
      amountCents: 1000,
      idempotencyKey: "k",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.retryable).toBe(false);
      expect(r.error).toMatch(/Safe Harbor/);
    }
  });
});

describe("PaymentRegistry", () => {
  it("dispatches a tender to its registered provider", () => {
    const r = new PaymentRegistry();
    const cash = new CashProvider();
    r.register(cash);
    expect(r.get("CASH")).toBe(cash);
  });

  it("throws on lookup of an unregistered tender", () => {
    const r = new PaymentRegistry();
    expect(() => r.get("CASH")).toThrow(/no provider registered/);
  });

  it("refuses to overwrite an existing registration; forceRegister bypasses", () => {
    const r = new PaymentRegistry();
    r.register(new CashProvider());
    expect(() => r.register(new CashProvider())).toThrow(/already registered/);

    const replacement = new CashProvider();
    r.forceRegister(replacement);
    expect(r.get("CASH")).toBe(replacement);
  });

  it("has() reports presence without throwing", () => {
    const r = new PaymentRegistry();
    expect(r.has("CASH")).toBe(false);
    r.register(new CashProvider());
    expect(r.has("CASH")).toBe(true);
    expect(r.has("ACH")).toBe(false);
  });

  it("tenders() lists all registered tenders", () => {
    const r = new PaymentRegistry();
    r.register(new CashProvider());
    r.register(new NotImplementedAchProvider());
    const tenders = [...r.tenders()].sort();
    expect(tenders).toEqual(["ACH", "CASH"]);
  });

  it("full MVP-shape registry: cash works, cashless-ATM + ACH refuse", async () => {
    const r = new PaymentRegistry();
    r.register(new CashProvider());
    r.register(new NotImplementedCashlessAtmProvider());
    r.register(new NotImplementedAchProvider());

    const cashResult = await r.get("CASH").charge({
      saleId: "s",
      tenantId: "t",
      amountCents: 100,
      idempotencyKey: "k",
    });
    expect(cashResult.ok).toBe(true);

    const atmResult = await r.get("CASHLESS_ATM").charge({
      saleId: "s",
      tenantId: "t",
      amountCents: 100,
      idempotencyKey: "k",
    });
    expect(atmResult.ok).toBe(false);

    const achResult = await r.get("ACH").charge({
      saleId: "s",
      tenantId: "t",
      amountCents: 100,
      idempotencyKey: "k",
    });
    expect(achResult.ok).toBe(false);
  });
});
