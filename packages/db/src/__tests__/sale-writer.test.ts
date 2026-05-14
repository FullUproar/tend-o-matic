import { describe, it, expect } from "vitest";
import {
  completeSale,
  SaleWriteError,
  type CompleteSaleArgs,
  type SaleWriterTx,
} from "../sale-writer";

// Mock TransactionClient that captures all SQL calls.
class MockTx {
  calls: Array<{ sql: string; params: unknown[] }> = [];

  async $executeRaw(): Promise<number> {
    throw new Error("$executeRaw not used by sale-writer");
  }

  async $executeRawUnsafe(query: string, ...values: unknown[]): Promise<number> {
    this.calls.push({ sql: query, params: values });
    return 1;
  }

  async $queryRawUnsafe<T = unknown>(): Promise<T[]> {
    return [];
  }
}

function baseArgs(over: Partial<CompleteSaleArgs> = {}): CompleteSaleArgs {
  return {
    tenantId: "00000000-0000-4000-8000-000000000001",
    locationId: "00000000-0000-4000-8000-000000000002",
    cashierUserId: "00000000-0000-4000-8000-000000000003",
    customerId: "00000000-0000-4000-8000-000000000004",
    customerKindAtSale: "MI_ADULT_USE",
    rulesetVersion: "mi-2026.05.14",
    subtotalCents: 5000,
    taxCents: 830,
    totalCents: 5830,
    lines: [
      {
        packageId: "00000000-0000-4000-8000-000000000010",
        category: "FLOWER",
        qty: 1,
        weightValue: 3.5,
        weightUnit: "G",
        unitPriceCents: 5000,
        lineTotalCents: 5000,
        equivalentGrams: 3.5,
      },
    ],
    tenders: [{ tenderType: "CASH", amountCents: 5830 }],
    ...over,
  };
}

describe("completeSale — happy path", () => {
  it("issues 5 INSERTs in order: sale, sale_item × N, payment × M, audit_log, metrc_outbox", async () => {
    const tx = new MockTx();
    const args = baseArgs({
      lines: [
        baseArgs().lines[0]!,
        { ...baseArgs().lines[0]!, packageId: "00000000-0000-4000-8000-000000000011" },
      ],
      tenders: [
        { tenderType: "CASH", amountCents: 3000 },
        { tenderType: "CASHLESS_ATM", amountCents: 2830 },
      ],
    });
    const r = await completeSale(tx as unknown as SaleWriterTx, args);

    expect(r.saleId).toMatch(/^[0-9a-f-]{36}$/);
    expect(r.auditLogId).toMatch(/^[0-9a-f-]{36}$/);
    expect(r.metrcOutboxId).toMatch(/^[0-9a-f-]{36}$/);

    // 1 sale + 2 sale_items + 2 payments + 1 audit_log + 1 metrc_outbox = 7
    expect(tx.calls.length).toBe(7);
    expect(tx.calls[0]!.sql).toMatch(/INSERT INTO sale\b/);
    expect(tx.calls[1]!.sql).toMatch(/INSERT INTO sale_item/);
    expect(tx.calls[2]!.sql).toMatch(/INSERT INTO sale_item/);
    expect(tx.calls[3]!.sql).toMatch(/INSERT INTO payment/);
    expect(tx.calls[4]!.sql).toMatch(/INSERT INTO payment/);
    expect(tx.calls[5]!.sql).toMatch(/INSERT INTO audit_log/);
    expect(tx.calls[6]!.sql).toMatch(/INSERT INTO metrc_outbox/);
  });

  it("uses the supplied saleId for idempotency when provided", async () => {
    const tx = new MockTx();
    const supplied = "11111111-1111-4111-8111-111111111111";
    const r = await completeSale(tx as unknown as SaleWriterTx, baseArgs({ saleId: supplied }));
    expect(r.saleId).toBe(supplied);
    // sale insert receives the supplied id as first parameter.
    expect(tx.calls[0]!.params[0]).toBe(supplied);
  });

  it("sale row carries tenantId, ruleset version, and COMPLETE status", async () => {
    const tx = new MockTx();
    const args = baseArgs();
    await completeSale(tx as unknown as SaleWriterTx, args);
    const saleCall = tx.calls[0]!;
    expect(saleCall.params[1]).toBe(args.tenantId);
    expect(saleCall.params[6]).toBe(args.rulesetVersion);
    expect(saleCall.sql).toMatch(/'COMPLETE'/);
  });

  it("audit_log payload includes line count, tender types, and totals", async () => {
    const tx = new MockTx();
    const args = baseArgs({
      tenders: [
        { tenderType: "CASH", amountCents: 3000 },
        { tenderType: "ACH", amountCents: 2830 },
      ],
    });
    await completeSale(tx as unknown as SaleWriterTx, args);
    const auditCall = tx.calls[tx.calls.length - 2]!;
    expect(auditCall.sql).toMatch(/INSERT INTO audit_log/);
    const payload = JSON.parse(auditCall.params[6] as string);
    expect(payload.lineCount).toBe(1);
    expect(payload.tenderTypes).toEqual(["CASH", "ACH"]);
    expect(payload.subtotalCents).toBe(args.subtotalCents);
    expect(payload.taxCents).toBe(args.taxCents);
    expect(payload.totalCents).toBe(args.totalCents);
  });

  it("metrc_outbox row uses sale-<id> as idempotency key", async () => {
    const tx = new MockTx();
    const r = await completeSale(tx as unknown as SaleWriterTx, baseArgs());
    const metrcCall = tx.calls[tx.calls.length - 1]!;
    expect(metrcCall.sql).toMatch(/INSERT INTO metrc_outbox/);
    expect(metrcCall.params[4]).toBe(`sale-${r.saleId}`);
    expect(metrcCall.params[2]).toBe("sale.recorded");
  });

  it("forwards bigint amounts as strings to avoid JS bigint serialization issues", async () => {
    const tx = new MockTx();
    await completeSale(tx as unknown as SaleWriterTx, baseArgs({ subtotalCents: 12345 }));
    const saleCall = tx.calls[0]!;
    expect(saleCall.params[7]).toBe("12345");
  });
});

describe("completeSale — validation failures", () => {
  it("throws when cart has no lines", async () => {
    const tx = new MockTx();
    await expect(
      completeSale(tx as unknown as SaleWriterTx, baseArgs({ lines: [] })),
    ).rejects.toThrow(SaleWriteError);
    expect(tx.calls.length).toBe(0);
  });

  it("throws when cart has no tenders", async () => {
    const tx = new MockTx();
    await expect(
      completeSale(tx as unknown as SaleWriterTx, baseArgs({ tenders: [] })),
    ).rejects.toThrow(SaleWriteError);
    expect(tx.calls.length).toBe(0);
  });

  it("throws when tender sum != totalCents (cashier under/over-tendered)", async () => {
    const tx = new MockTx();
    await expect(
      completeSale(
        tx as unknown as SaleWriterTx,
        baseArgs({
          totalCents: 5830,
          tenders: [{ tenderType: "CASH", amountCents: 5000 }], // missing $8.30
        }),
      ),
    ).rejects.toThrow(/tender sum 5000 != totalCents 5830/);
  });

  it("does not write any rows on validation failure", async () => {
    const tx = new MockTx();
    try {
      await completeSale(tx as unknown as SaleWriterTx, baseArgs({ lines: [] }));
    } catch {}
    expect(tx.calls.length).toBe(0);
  });
});

describe("completeSale — line-level handling", () => {
  it("equivalentGrams=null is forwarded as null SQL parameter", async () => {
    const tx = new MockTx();
    await completeSale(
      tx as unknown as SaleWriterTx,
      baseArgs({
        lines: [
          {
            ...baseArgs().lines[0]!,
            equivalentGrams: null,
          },
        ],
      }),
    );
    const saleItemCall = tx.calls[1]!;
    expect(saleItemCall.params[10]).toBeNull();
  });

  it("each sale_item line gets its own UUID", async () => {
    const tx = new MockTx();
    await completeSale(
      tx as unknown as SaleWriterTx,
      baseArgs({
        lines: [
          baseArgs().lines[0]!,
          { ...baseArgs().lines[0]!, packageId: "00000000-0000-4000-8000-0000000000aa" },
          { ...baseArgs().lines[0]!, packageId: "00000000-0000-4000-8000-0000000000bb" },
        ],
      }),
    );
    const itemIds = tx.calls
      .filter((c) => /INSERT INTO sale_item/.test(c.sql))
      .map((c) => c.params[0]);
    expect(new Set(itemIds).size).toBe(3);
  });
});
