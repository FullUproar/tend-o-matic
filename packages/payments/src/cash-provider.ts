import type { Charge, ChargeResult, PaymentProvider } from "./provider";
import type { TenderType } from "./tender";
import { randomUUID } from "node:crypto";

// CashProvider is the only payment provider that always succeeds
// synchronously: cash is the physical transaction itself, the system
// only records that it happened. Refunds for cash require physical
// drawer access + a manager override (M5 flow).
//
// Idempotency: cash charges are inherently idempotent at the
// application level via the Sale.id (a duplicate sale insert fails
// at the DB layer). The providerRef returned here is just a unique
// receipt-friendly identifier for the cash drawer event, not a
// guarantee of dedup.
export class CashProvider implements PaymentProvider {
  tender: TenderType = "CASH";
  name = "Cash";

  async charge(c: Charge): Promise<ChargeResult> {
    if (c.amountCents <= 0) {
      return {
        ok: false,
        retryable: false,
        error: `CashProvider: amountCents must be > 0, got ${c.amountCents}`,
      };
    }
    return {
      ok: true,
      providerRef: `cash-${randomUUID()}`,
      capturedAt: new Date().toISOString(),
    };
  }
}
