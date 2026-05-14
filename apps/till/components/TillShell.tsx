"use client";

import { useMemo, useState, useTransition } from "react";
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
import { TenderEntry } from "./TenderEntry";
import { ReceiptPreview } from "./ReceiptPreview";
import type { SessionIdentity } from "../lib/identity";
import { completeSaleAction, signOutAction } from "../app/actions";
import { refusalToText } from "../lib/refusal-text";

type Props = {
  identity: SessionIdentity;
};

const kernel = makeKernel({ requireRulesetStatus: "secondary-cite-only" });

type CompletedSale = {
  saleId: string;
  receiptText: string;
  changeDueCents: number;
};

export function TillShell({ identity }: Props) {
  const buildInitialCart = (): Cart =>
    openCart({
      tenantId: identity.tenantId,
      locationId: identity.locationId,
      customer: { kind: "MI_ADULT_USE" },
      ruleset: MI_2026_05_14,
    });

  const [cart, setCart] = useState<Cart>(buildInitialCart);
  const [refusal, setRefusal] = useState<RefusalReason | null>(null);
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const taxResult = useMemo(() => computeTaxBreakdown(cart), [cart]);
  const grandTotalCents = taxResult.ok ? taxResult.breakdown.grandTotalCents : 0;

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

  const onCompleteSale = (tenderCents: number) => {
    setServerError(null);
    startTransition(async () => {
      const response = await completeSaleAction({
        customer: cart.customer,
        rulesetVersion: cart.ruleset.version,
        idVerified: cart.idVerified,
        lines: cart.lines,
        tenderAmountCents: tenderCents,
      });
      if (response.ok) {
        setCompletedSale({
          saleId: response.saleId,
          receiptText: response.receiptText,
          changeDueCents: response.changeDueCents,
        });
      } else {
        const text = response.refusal
          ? `${response.reason} (${refusalToText(response.refusal)})`
          : response.reason;
        setServerError(text);
      }
    });
  };

  const onStartNewSale = () => {
    setCart(buildInitialCart());
    setRefusal(null);
    setCompletedSale(null);
    setServerError(null);
  };

  return (
    <main className="min-h-screen bg-parchment text-ink">
      {identity.tenantTraining && (
        <div className="bg-mustard-400 px-4 py-2 text-center text-sm font-semibold text-ink">
          ⚠ TRAINING MODE — sales are recorded but not flagged as production
          transactions
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
          <div className="flex items-center gap-4 text-right text-xs">
            <div>
              <div className="font-medium">{identity.tenantName}</div>
              <div className="text-ink-soft">
                {identity.locationName} · {identity.locationLicense}
              </div>
              <div className="text-ink-soft">
                {identity.cashierName} · {identity.cashierRole.toLowerCase()}
              </div>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-sm border border-kraft-300 px-3 py-1 text-xs text-ink-soft hover:border-kraft-500 hover:text-ink"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_1fr]">
        <section className="space-y-4">
          {completedSale ? (
            <ReceiptPreview
              receiptText={completedSale.receiptText}
              saleId={completedSale.saleId}
              changeDueCents={completedSale.changeDueCents}
              onStartNewSale={onStartNewSale}
            />
          ) : (
            <>
              <CustomerSelector
                customer={cart.customer}
                idVerified={cart.idVerified}
                onCustomerChange={onSetCustomer}
                onIdVerifiedChange={onSetIdVerified}
              />
              <LineEntry onAddLine={onAddLine} />
              {refusal && <RefusalBanner refusal={refusal} />}
              {serverError && (
                <div
                  role="alert"
                  className="rounded-md border-l-4 border-danger bg-clay-300 bg-opacity-30 p-3 text-sm text-ink"
                >
                  <div className="font-semibold uppercase text-danger">
                    Server refused sale
                  </div>
                  <div className="mt-1">{serverError}</div>
                </div>
              )}
            </>
          )}
        </section>

        <section className="space-y-4">
          <CartView
            cart={cart}
            taxBreakdown={taxResult.ok ? taxResult.breakdown : null}
            taxRefusal={taxResult.ok ? null : taxResult.reason}
            onRemoveLine={onRemoveLine}
          />
          {!completedSale && (
            <TenderEntry
              totalCents={grandTotalCents}
              disabled={cart.lines.length === 0 || !taxResult.ok}
              busy={isPending}
              onComplete={onCompleteSale}
            />
          )}
        </section>
      </div>
    </main>
  );
}
