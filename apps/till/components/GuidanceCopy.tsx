"use client";

// Service-mode-aware guidance copy. Lives in the budtender's
// peripheral vision while a cart is being built; each mode surfaces a
// different reminder.
//
// MEDICAL_SENSITIVE is the load-bearing one: the 2026-05-14 Manus
// brief flags published research finding that budtender medical
// guidance diverges from clinician consensus. When the budtender
// signals this mode, the system reminds them — visibly — that they
// are not a clinician.
//
// FIRST_TIME surfaces "start low / go slow" + an ID-verify nudge.
// GUIDED surfaces a recommend-products prompt (handoff to the
// product intelligence panel, which lands in M12). EXPRESS shows
// nothing — by design, that mode is about reducing on-screen friction.

import type { ServiceMode } from "@tend-o-matic/compliance";

type Props = { mode: ServiceMode };

export function GuidanceCopy({ mode }: Props) {
  if (mode === "EXPRESS") return null;

  if (mode === "MEDICAL_SENSITIVE") {
    return (
      <div
        role="note"
        aria-label="Medical-sensitive guidance"
        className="rounded-md border-l-4 border-info bg-paper p-3 text-sm text-ink"
      >
        <div className="font-display text-xs font-semibold uppercase tracking-wide text-info">
          Medical-sensitive mode
        </div>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs leading-relaxed text-ink-soft">
          <li>
            Share product facts (cannabinoids, terpenes, format, onset, duration).
            Do <em>not</em> diagnose, treat, or recommend cannabis as medication.
          </li>
          <li>
            For any symptom or condition the customer raises, suggest they consult
            a clinician — their PCP, a cannabis-credentialed MD, or a pharmacist.
          </li>
          <li>
            "Start low and go slow." Especially with edibles, tinctures, and
            anything &gt;20 mg THC per serving.
          </li>
        </ul>
      </div>
    );
  }

  if (mode === "FIRST_TIME") {
    return (
      <div
        role="note"
        aria-label="First-time guidance"
        className="rounded-md border-l-4 border-mustard-500 bg-paper p-3 text-sm text-ink"
      >
        <div className="font-display text-xs font-semibold uppercase tracking-wide text-mustard-700">
          First-time customer
        </div>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs leading-relaxed text-ink-soft">
          <li>Verify ID even if they look 30+. State law, not store policy.</li>
          <li>
            Ask about prior cannabis experience and target effect — gives you a
            real conversation, not a guess.
          </li>
          <li>
            Default to low-dose options (2.5–5 mg edibles, lower-potency flower).
            Easier to dose up next visit than to recover from a bad first one.
          </li>
        </ul>
      </div>
    );
  }

  // GUIDED — soft prompt, no banner color. Just a nudge that this is
  // a consultative interaction.
  return (
    <div className="rounded-md border border-dashed border-kraft-300 bg-paper p-3 text-xs text-ink-soft">
      <span className="font-semibold">Guided mode.</span> Lead with effect and
      format, not THC%. Ask about tolerance, preferred onset speed, and budget
      before recommending.
    </div>
  );
}
