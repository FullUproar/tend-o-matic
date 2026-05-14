import type { Charge, ChargeResult, PaymentProvider } from "./provider";
import type { TenderType } from "./tender";

// Placeholder providers for tenders we have not yet wired to a real
// provider (Aeropay for CASHLESS_ATM, an ACH partner for ACH). They
// refuse with `retryable: false` so the UI surfaces them as "feature
// not yet enabled" rather than a transient error to retry.

export class NotImplementedCashlessAtmProvider implements PaymentProvider {
  tender: TenderType = "CASHLESS_ATM";
  name = "Cashless ATM (not yet wired)";

  async charge(_c: Charge): Promise<ChargeResult> {
    return {
      ok: false,
      retryable: false,
      error:
        "CASHLESS_ATM provider is not yet wired. Configure Aeropay/Paybotic/KindPay credentials per round-2 D1 before enabling.",
    };
  }
}

export class NotImplementedAchProvider implements PaymentProvider {
  tender: TenderType = "ACH";
  name = "ACH (not yet wired)";

  async charge(_c: Charge): Promise<ChargeResult> {
    return {
      ok: false,
      retryable: false,
      error:
        "ACH provider is not yet wired. ACH partnership + banking setup (Safe Harbor Financial per round-2 C1) required first.",
    };
  }
}
