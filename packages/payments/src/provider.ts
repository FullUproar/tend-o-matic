import type { TenderType } from "./tender";

// PaymentProvider is the abstract surface every concrete provider
// (cash drawer, Aeropay, CanPay, etc.) implements. v0.1 ships only
// the interface.
export type Charge = {
  saleId: string;
  tenantId: string;
  amountCents: number;
  idempotencyKey: string;
};

export type ChargeResult =
  | {
      ok: true;
      providerRef: string;
      capturedAt: string;
    }
  | {
      ok: false;
      retryable: boolean;
      error: string;
    };

export interface PaymentProvider {
  tender: TenderType;
  name: string;
  charge(c: Charge): Promise<ChargeResult>;
  // Refund / void are required for the returns workflow but their
  // semantics differ enough by provider that the signature lives on
  // the concrete impl, not the interface.
}
