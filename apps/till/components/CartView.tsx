"use client";

import type {
  Cart,
  TaxBreakdown,
  RefusalReason,
} from "@tend-o-matic/compliance";
import type { CatalogProduct } from "../lib/catalog";
import { refusalToText } from "../lib/refusal-text";

type Props = {
  cart: Cart;
  catalog: ReadonlyArray<CatalogProduct>;
  taxBreakdown: TaxBreakdown | null;
  taxRefusal: RefusalReason | null;
  onRemoveLine: (packageId: string) => void;
};

function formatCents(c: number): string {
  const neg = c < 0;
  const abs = Math.abs(c);
  return `${neg ? "-" : ""}$${(abs / 100).toFixed(2)}`;
}

export function CartView({
  cart,
  catalog,
  taxBreakdown,
  taxRefusal,
  onRemoveLine,
}: Props) {
  const lineCount = cart.lines.length;
  // Till uses Product.id as packageId on the LineItem; resolve back to
  // a human-readable product name for display.
  const productById = new Map(catalog.map((p) => [p.id, p] as const));

  return (
    <div className="rounded-md border border-kraft-300 bg-cream p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-base font-semibold text-ink">Cart</h2>
        <span className="text-xs text-ink-soft">
          {lineCount} {lineCount === 1 ? "line" : "lines"} ·{" "}
          {cart.ruleset.version}
        </span>
      </div>

      {lineCount === 0 ? (
        <p className="mt-6 rounded-sm border border-dashed border-kraft-300 bg-paper px-4 py-8 text-center text-sm text-ink-soft">
          Empty cart. Add a line on the left.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-kraft-300">
          {cart.lines.map((line) => {
            const product = productById.get(line.packageId);
            const productName = product?.name ?? line.category;
            const productSku = product?.sku ?? line.packageId.slice(0, 8);
            return (
              <li
                key={line.packageId}
                className="flex items-center justify-between gap-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{productName}</div>
                  <div className="text-xs text-ink-soft">
                    {line.weight.value} {line.weight.unit} × {line.qty} ·{" "}
                    <span className="font-mono">{productSku}</span>
                  </div>
                </div>
                <div className="font-mono text-sm">
                  {formatCents(line.unitPriceCents * line.qty)}
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveLine(line.packageId)}
                  className="rounded-sm border border-clay-500 px-2 py-1 text-xs text-clay-700 hover:bg-clay-500 hover:text-cream"
                  aria-label={`Remove ${productName}`}
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 border-t-2 border-kraft-700 pt-3">
        {taxBreakdown ? (
          <dl className="grid grid-cols-[1fr_max-content] gap-y-1 text-sm">
            <dt>Subtotal</dt>
            <dd className="text-right font-mono">
              {formatCents(taxBreakdown.subtotalCents)}
            </dd>
            {taxBreakdown.lines.map((tax, i) => (
              <FragmentRow
                key={`${tax.code}-${i}`}
                label={tax.label}
                amount={tax.amountCents}
              />
            ))}
            <dt className="text-ink-soft">Tax total</dt>
            <dd className="text-right font-mono text-ink-soft">
              {formatCents(taxBreakdown.totalTaxCents)}
            </dd>
            <dt className="border-t border-kraft-700 pt-1 font-display text-base font-semibold">
              TOTAL
            </dt>
            <dd className="border-t border-kraft-700 pt-1 text-right font-mono text-base font-semibold">
              {formatCents(taxBreakdown.grandTotalCents)}
            </dd>
          </dl>
        ) : taxRefusal ? (
          <div className="rounded-sm bg-clay-500 px-3 py-2 text-sm text-cream">
            <span className="font-semibold">Tax not computable:</span>{" "}
            {refusalToText(taxRefusal)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FragmentRow({ label, amount }: { label: string; amount: number }) {
  return (
    <>
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right font-mono text-ink-soft">
        {formatCents(amount)}
      </dd>
    </>
  );
}
