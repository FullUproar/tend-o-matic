"use client";

type Props = {
  receiptText: string;
  saleId: string;
  changeDueCents: number;
  onStartNewSale: () => void;
};

function formatCents(c: number): string {
  return `$${(c / 100).toFixed(2)}`;
}

export function ReceiptPreview({
  receiptText,
  saleId,
  changeDueCents,
  onStartNewSale,
}: Props) {
  return (
    <div className="rounded-md border border-leaf-700 bg-cream p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-base font-semibold text-leaf-700">
          ✓ Sale recorded
        </h2>
        <span className="font-mono text-xs text-ink-soft">
          {saleId.slice(0, 8)}
        </span>
      </div>

      {changeDueCents > 0 && (
        <div className="mt-3 rounded-sm bg-mustard-400 px-3 py-2 text-center">
          <div className="text-xs uppercase tracking-wide text-ink-soft">
            Give the customer
          </div>
          <div className="font-display text-2xl font-semibold text-ink">
            {formatCents(changeDueCents)}
          </div>
        </div>
      )}

      <pre className="mt-4 overflow-x-auto rounded-sm border border-kraft-300 bg-paper px-3 py-2 font-mono text-xs leading-tight">
        {receiptText}
      </pre>

      <button
        type="button"
        onClick={onStartNewSale}
        className="mt-4 w-full rounded-sm border-2 border-leaf-700 bg-cream px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide text-leaf-700 hover:bg-leaf-700 hover:text-cream"
      >
        Start new sale
      </button>
    </div>
  );
}
