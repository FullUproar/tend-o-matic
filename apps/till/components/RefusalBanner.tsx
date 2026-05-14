"use client";

import type { RefusalReason } from "@tend-o-matic/compliance";
import { refusalToText } from "../lib/refusal-text";

type Props = {
  refusal: RefusalReason;
};

export function RefusalBanner({ refusal }: Props) {
  return (
    <div
      role="alert"
      className="rounded-md border-l-4 border-clay-500 bg-clay-300 bg-opacity-30 p-3"
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-clay-700">
        Refused — {refusal.code}
      </div>
      <div className="mt-1 text-sm text-ink">{refusalToText(refusal)}</div>
    </div>
  );
}
