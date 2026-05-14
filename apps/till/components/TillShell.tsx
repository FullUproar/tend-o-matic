"use client";

import { useMemo, useState } from "react";
import {
  makeKernel,
  openCart,
  reduce,
  computeTaxBreakdown,
  MI_2026_05_14,
  type Cart,
  type CustomerType,
  type LineItem,
  type RefusalReason,
} from "@tend-o-matic/compliance";
import { CustomerSelector } from "./CustomerSelector";
import { LineEntry } from "./LineEntry";
import { CartView } from "./CartView";
import { RefusalBanner } from "./RefusalBanner";
import type { SeedIdentity } from "../lib/identity";

type Props = {
  identity: SeedIdentity;
};

const kernel = makeKernel({ requireRulesetStatus: "secondary-cite-only" });

export function TillShell({ identity }: Props) {
  const initialCart = useMemo(
    () =>
      openCart({
        tenantId: identity.tenantId,
        locationId: identity.locationId,
        customer: { kind: "MI_ADULT_USE" },
        ruleset: MI_2026_05_14,
      }),
    [identity.tenantId, identity.locationId],
  );

  const [cart, setCart] = useState<Cart>(initialCart);
  const [refusal, setRefusal] = useState<RefusalReason | null>(null);

  const taxResult = useMemo(() => computeTaxBreakdown(cart), [cart]);

  const onSetCustomer = (customer: CustomerType) => {
    const r = reduce(cart, { type: "SET_CUSTOMER", customer }, kernel);
    if (r.ok) {
      setCart(r.cart);
      setRefusal(null);
    } else {
      setRefusal(r.reason);
    }
  };

  const onSetIdVerified = (idVerified: boolean) => {
    const r = reduce(cart, { type: "SET_ID_VERIFIED", idVerified }, kernel);
    if (r.ok) {
      setCart(r.cart);
      setRefusal(null);
    } else {
      setRefusal(r.reason);
    }
  };

  const onAddLine = (line: LineItem) => {
    const r = reduce(cart, { type: "ADD_LINE", line }, kernel);
    if (r.ok) {
      setCart(r.cart);
      setRefusal(null);
    } else {
      setRefusal(r.reason);
    }
  };

  const onRemoveLine = (packageId: string) => {
    const r = reduce(cart, { type: "REMOVE_LINE", packageId }, kernel);
    if (r.ok) {
      setCart(r.cart);
      setRefusal(null);
    }
  };

  return (
    <main className="min-h-screen bg-parchment text-ink">
      {identity.tenantTraining && (
        <div className="bg-mustard-400 px-4 py-2 text-center text-sm font-semibold text-ink">
          ⚠ TRAINING MODE — no real sales, no METRC writes, no inventory
          decrements
        </div>
      )}

      <header className="border-b-2 border-kraft-700 bg-cream px-6 py-3">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-2xl font-semibold tracking-wide text-mustard-500">
              TEND-O-MATIC
            </span>
            <span className="font-script text-lg text-clay-500">till</span>
          </div>
          <div className="text-right text-xs">
            <div className="font-medium">{identity.tenantName}</div>
            <div className="text-ink-soft">
              {identity.locationName} · {identity.locationLicense}
            </div>
            <div className="text-ink-soft">Cashier: {identity.cashierName}</div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_1fr]">
        <section className="space-y-4">
          <CustomerSelector
            customer={cart.customer}
            idVerified={cart.idVerified}
            onCustomerChange={onSetCustomer}
            onIdVerifiedChange={onSetIdVerified}
          />
          <LineEntry onAddLine={onAddLine} />
          {refusal && <RefusalBanner refusal={refusal} />}
        </section>

        <section>
          <CartView
            cart={cart}
            taxBreakdown={taxResult.ok ? taxResult.breakdown : null}
            taxRefusal={taxResult.ok ? null : taxResult.reason}
            onRemoveLine={onRemoveLine}
          />
        </section>
      </div>
    </main>
  );
}
