"use client";

// Refusal banner — two-layer rendering of a kernel refusal:
//
//   1) The budtender diagnostic (small, top): refusal code + a
//      one-line plain-English version of the kernel reason. This is
//      what the budtender uses to triage the cart.
//   2) The customer-safe script (large, below): read-aloud copy
//      that frames the refusal as a compliance constraint, gives
//      the customer the relevant number, and offers a path
//      forward. A "Copy" button puts the script on the clipboard
//      so the budtender can paste it into an SMS or email if the
//      customer doesn't want to be read to.
//
// Source for the script copy: docs/budtender-rockstar-plan.md
// (Finding #6, "Explainable compliance blocks").

import { useState } from "react";
import type { RefusalReason } from "@tend-o-matic/compliance";
import { refusalToText } from "../lib/refusal-text";
import {
  refusalToCustomerScript,
  customerScriptToText,
} from "../lib/refusal-customer-script";

type Props = {
  refusal: RefusalReason;
};

export function RefusalBanner({ refusal }: Props) {
  const script = refusalToCustomerScript(refusal);
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(customerScriptToText(script));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail in non-secure contexts (HTTP, some
      // embedded webviews). Surface nothing — the script is right
      // there on screen for the budtender to read.
    }
  };

  return (
    <div
      role="alert"
      className="rounded-md border-l-4 border-clay-500 bg-clay-300 bg-opacity-30 p-3"
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-clay-700">
          Refused — {refusal.code}
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-sm border border-kraft-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft hover:border-kraft-500 hover:text-ink"
          aria-label="Copy customer script to clipboard"
        >
          {copied ? "Copied" : "Copy script"}
        </button>
      </div>
      <div className="mt-1 text-xs italic text-ink-soft">
        {refusalToText(refusal)}
      </div>

      <div
        aria-label="Customer script"
        className="mt-3 rounded-sm bg-cream p-3 text-sm text-ink"
      >
        <p className="font-display text-base font-semibold leading-snug">
          {script.headline}
        </p>
        {script.body && (
          <p className="mt-2 text-sm leading-snug text-ink-soft">
            {script.body}
          </p>
        )}
        {script.suggestion && (
          <p className="mt-2 text-sm leading-snug text-leaf-700">
            {script.suggestion}
          </p>
        )}
      </div>
    </div>
  );
}
