import type { PaymentProvider } from "./provider";
import type { TenderType } from "./tender";

// PaymentRegistry routes a TenderType to a concrete PaymentProvider.
// The till app instantiates a single registry per tenant (because
// payment providers are tenant-scoped — different tenants may have
// different Aeropay / ACH credentials) and looks up the provider for
// each tender on a sale.
//
// Construction order: register more-specific providers first; the
// registry refuses to overwrite an existing tender. Use
// `forceRegister` to override during testing.
export class PaymentRegistry {
  private providers = new Map<TenderType, PaymentProvider>();

  register(provider: PaymentProvider): void {
    if (this.providers.has(provider.tender)) {
      throw new Error(
        `PaymentRegistry: tender ${provider.tender} already registered to ${
          this.providers.get(provider.tender)!.name
        }. Use forceRegister() to override.`,
      );
    }
    this.providers.set(provider.tender, provider);
  }

  forceRegister(provider: PaymentProvider): void {
    this.providers.set(provider.tender, provider);
  }

  get(tender: TenderType): PaymentProvider {
    const p = this.providers.get(tender);
    if (!p) {
      throw new Error(
        `PaymentRegistry: no provider registered for tender ${tender}. Did you forget to register the CashProvider?`,
      );
    }
    return p;
  }

  has(tender: TenderType): boolean {
    return this.providers.has(tender);
  }

  tenders(): ReadonlyArray<TenderType> {
    return [...this.providers.keys()];
  }
}
