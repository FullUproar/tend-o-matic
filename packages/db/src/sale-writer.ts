// Sale write path. Atomically inserts a sale + its items + payments,
// plus the same-transaction audit log entry and METRC outbox row.
//
// The function is RLS-aware: it MUST be called inside withTenant() (or
// some other context that has set app.tenant_id). It uses parameterized
// raw SQL via the structural TransactionClient interface to avoid a
// hard runtime dependency on @prisma/client at this package boundary.

import { randomUUID } from "node:crypto";
import type { TransactionClient } from "./tenant-context";

// Structural extension of TransactionClient to add $queryRaw* methods
// needed for INSERT...RETURNING. The Prisma transaction client supplies
// these at runtime.
export interface SaleWriterTx extends TransactionClient {
  $queryRawUnsafe<T = unknown>(query: string, ...values: unknown[]): Promise<T[]>;
}

export type SaleLineInput = {
  packageId: string;
  category: string; // ProductCategory enum value
  qty: number;
  weightValue: number;
  weightUnit: string;
  unitPriceCents: number;
  lineTotalCents: number;
  // Equivalent grams toward TOTAL_OUNCES (MI rollup). Null when not
  // applicable (IL per-category tracking).
  equivalentGrams?: number | null;
};

export type SalePaymentInput = {
  tenderType: string; // TenderType enum value
  amountCents: number;
  providerRef?: string | null;
};

export type CompleteSaleArgs = {
  tenantId: string;
  locationId: string;
  cashierUserId: string;
  customerId: string | null;
  customerKindAtSale: string | null;
  rulesetVersion: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  lines: ReadonlyArray<SaleLineInput>;
  tenders: ReadonlyArray<SalePaymentInput>;
  // Optional client-supplied UUID for idempotency. If absent, server
  // mints one. A duplicate insert with the same id raises a unique-
  // key violation, which the application layer can map to a no-op.
  saleId?: string;
  // Optional ISO datetime. Defaults to NOW().
  closedAt?: string;
};

export type CompleteSaleResult = {
  saleId: string;
  auditLogId: string;
  metrcOutboxId: string;
};

export class SaleWriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SaleWriteError";
  }
}

// completeSale performs the five inserts (sale, sale_item × N,
// payment × M, audit_log, metrc_outbox) in the supplied transaction.
// The caller is responsible for wrapping the call in withTenant() so
// that RLS policies see the tenant GUC and writes are scoped.
export async function completeSale(
  tx: SaleWriterTx,
  args: CompleteSaleArgs,
): Promise<CompleteSaleResult> {
  if (args.lines.length === 0) {
    throw new SaleWriteError("completeSale: cart has no lines");
  }
  if (args.tenders.length === 0) {
    throw new SaleWriteError("completeSale: cart has no tenders");
  }
  const tenderSum = args.tenders.reduce((a, t) => a + t.amountCents, 0);
  if (tenderSum !== args.totalCents) {
    throw new SaleWriteError(
      `completeSale: tender sum ${tenderSum} != totalCents ${args.totalCents}`,
    );
  }

  const saleId = args.saleId ?? randomUUID();
  const closedAt = args.closedAt ?? new Date().toISOString();

  // 1. Sale header. status set to COMPLETE directly (skipping OPEN
  // because we're recording a fait accompli — the cart was kernel-
  // approved and tendered before this function is called).
  await tx.$executeRawUnsafe(
    `INSERT INTO sale (
       id, tenant_id, location_id, cashier_user_id, customer_id,
       customer_kind_at_sale, ruleset_version, status,
       subtotal_cents, tax_cents, total_cents, opened_at, closed_at
     ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid,
              $6::customer_kind, $7, 'COMPLETE',
              $8::bigint, $9::bigint, $10::bigint, $11::timestamptz, $11::timestamptz)`,
    saleId,
    args.tenantId,
    args.locationId,
    args.cashierUserId,
    args.customerId,
    args.customerKindAtSale,
    args.rulesetVersion,
    String(args.subtotalCents),
    String(args.taxCents),
    String(args.totalCents),
    closedAt,
  );

  // 2. Sale items + per-line package qty decrement. The decrement is
  // in the same transaction as the sale_item insert; if either fails
  // the whole sale rolls back (atomic with audit + metrc outbox).
  // Decrement amount = weight_value × qty. If decrement would push qty
  // below 0 the SQL raises a check-constraint-style error via
  // `WHERE qty >= $decrement`; the UPDATE's row count goes to 0 and
  // we throw a SaleWriteError explicitly so the caller sees it.
  for (const line of args.lines) {
    await tx.$executeRawUnsafe(
      `INSERT INTO sale_item (
         id, tenant_id, sale_id, package_id, category, qty,
         weight_value, weight_unit, unit_price_cents, line_total_cents,
         equivalent_grams
       ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::product_category, $6::decimal,
                $7::decimal, $8, $9::bigint, $10::bigint, $11::decimal)`,
      randomUUID(),
      args.tenantId,
      saleId,
      line.packageId,
      line.category,
      String(line.qty),
      String(line.weightValue),
      line.weightUnit,
      String(line.unitPriceCents),
      String(line.lineTotalCents),
      line.equivalentGrams === null || line.equivalentGrams === undefined
        ? null
        : String(line.equivalentGrams),
    );

    // Decrement the package's qty by weightValue × qty. Conditional
    // UPDATE refuses to go below zero. After the UPDATE, mark the
    // package DEPLETED if qty hit exactly zero.
    const decrement = line.weightValue * line.qty;
    const rowsAffected = await tx.$executeRawUnsafe(
      `UPDATE package
         SET qty = qty - $1::decimal
         WHERE id = $2::uuid
           AND tenant_id = $3::uuid
           AND status IN ('AVAILABLE', 'HOLD')
           AND qty >= $1::decimal`,
      String(decrement),
      line.packageId,
      args.tenantId,
    );
    if (rowsAffected === 0) {
      throw new SaleWriteError(
        `Package ${line.packageId} could not be decremented (insufficient qty or non-sellable status).`,
      );
    }
    // Mark as DEPLETED if qty went to exactly zero.
    await tx.$executeRawUnsafe(
      `UPDATE package
         SET status = 'DEPLETED'
         WHERE id = $1::uuid
           AND tenant_id = $2::uuid
           AND qty = 0
           AND status = 'AVAILABLE'`,
      line.packageId,
      args.tenantId,
    );
  }

  // 3. Payments.
  for (const tender of args.tenders) {
    await tx.$executeRawUnsafe(
      `INSERT INTO payment (
         id, tenant_id, sale_id, tender_type, amount_cents, provider_ref
       ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::tender_type, $5::bigint, $6)`,
      randomUUID(),
      args.tenantId,
      saleId,
      tender.tenderType,
      String(tender.amountCents),
      tender.providerRef ?? null,
    );
  }

  // 4. Audit log. Same transaction; if audit insert fails the whole
  // sale rolls back. Append-only is enforced at the DB level by the
  // restrictive policies on the audit_log table.
  const auditLogId = randomUUID();
  const auditPayload = JSON.stringify({
    subtotalCents: args.subtotalCents,
    taxCents: args.taxCents,
    totalCents: args.totalCents,
    lineCount: args.lines.length,
    tenderTypes: args.tenders.map((t) => t.tenderType),
    rulesetVersion: args.rulesetVersion,
  });
  await tx.$executeRawUnsafe(
    `INSERT INTO audit_log (
       id, tenant_id, actor_user_id, entity_type, entity_id, action, payload, at
     ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5::uuid, $6, $7::jsonb, $8::timestamptz)`,
    auditLogId,
    args.tenantId,
    args.cashierUserId,
    "sale",
    saleId,
    "completed",
    auditPayload,
    closedAt,
  );

  // 5. METRC outbox. Queued for the outbox worker (M7) to drain.
  // idempotencyKey = `sale-${saleId}` so the worker can de-dupe.
  const metrcOutboxId = randomUUID();
  const metrcPayload = JSON.stringify({
    saleId,
    closedAt,
    lines: args.lines.map((l) => ({
      packageId: l.packageId,
      qty: l.qty,
      weightValue: l.weightValue,
      weightUnit: l.weightUnit,
    })),
  });
  await tx.$executeRawUnsafe(
    `INSERT INTO metrc_outbox (
       id, tenant_id, operation, payload, idempotency_key, status, queued_at
     ) VALUES ($1::uuid, $2::uuid, $3, $4::jsonb, $5, 'QUEUED', $6::timestamptz)`,
    metrcOutboxId,
    args.tenantId,
    "sale.recorded",
    metrcPayload,
    `sale-${saleId}`,
    closedAt,
  );

  return { saleId, auditLogId, metrcOutboxId };
}
