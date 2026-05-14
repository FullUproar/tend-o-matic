"use client";

import { useEffect, useState } from "react";

type Props = {
  totalCents: number;
  disabled: boolean;
  busy: boolean;
  onComplete: (tenderCents: number) => void;
};

function formatCents(c: number): string {
  const neg = c < 0;
  const abs = Math.abs(c);
  return `${neg ? "-" : ""}$${(abs / 100).toFixed(2)}`;
}

export function TenderEntry({ totalCents, disabled, busy, onComplete }: Props) {
  const [tenderInput, setTenderInput] = useState("");

  // Auto-fill tender input to match total when the total becomes positive,
  // so the cashier can one-tap "Complete sale" for exact-change scenarios.
  useEffect(() => {
    if (totalCents > 0 && tenderInput === "") {
      setTenderInput((totalCents / 100).toFixed(2));
    }
  }, [totalCents, tenderInput]);

  const tenderCents = Math.round(parseFloat(tenderInput || "0") * 100);
  const sufficient = Number.isFinite(tenderCents) && tenderCents >= totalCents;
  const changeCents = sufficient ? tenderCents - totalCents : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sufficient || disabled || busy) return;
    onComplete(tenderCents);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-kraft-300 bg-cream p-4"
    >
      <h2 className="font-display text-sm font-semibold text-ink">
        Tender (cash)
      </h2>
      <div className="mt-3 flex items-center gap-3">
        <label className="flex-1">
          <span className="block text-xs text-ink-soft">
            Cash tendered (dollars)
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={tenderInput}
            onChange={(e) => setTenderInput(e.target.value)}
            disabled={disabled || busy}
            className="mt-1 w-full rounded-sm border border-kraft-300 bg-paper px-3 py-3 text-right font-mono text-lg disabled:bg-disabled disabled:opacity-50"
          />
        </label>
        <div className="text-right">
          <div className="text-xs text-ink-soft">Change due</div>
          <div className="font-mono text-lg">{formatCents(changeCents)}</div>
        </div>
      </div>
      <button
        type="submit"
        disabled={!sufficient || disabled || busy}
        className="mt-4 w-full rounded-sm bg-leaf-700 px-4 py-4 font-display text-base font-semibold uppercase tracking-wide text-cream transition-colors hover:bg-leaf-600 disabled:cursor-not-allowed disabled:bg-kraft-300 disabled:text-ink-soft"
      >
        {busy
          ? "Recording sale…"
          : disabled
            ? "Add at least one line"
            : !sufficient
              ? `Need ${formatCents(totalCents - tenderCents)} more`
              : `Complete sale · ${formatCents(totalCents)}`}
      </button>
    </form>
  );
}
