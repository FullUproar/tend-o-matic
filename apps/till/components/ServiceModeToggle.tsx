"use client";

// Service-mode picker for the till. Sits above the customer selector so
// the budtender can declare "this is going to be quick" or "this person
// needs help" before they start adding line items. Cart-level setting;
// pure UI hint to other till components — never gates a kernel check.

import type { ServiceMode } from "@tend-o-matic/compliance";
import { serviceModeLabel, serviceModeDescription } from "@tend-o-matic/compliance";

type Props = {
  mode: ServiceMode;
  onChange: (mode: ServiceMode) => void;
};

const MODES: ReadonlyArray<ServiceMode> = [
  "EXPRESS",
  "GUIDED",
  "FIRST_TIME",
  "MEDICAL_SENSITIVE",
];

export function ServiceModeToggle({ mode, onChange }: Props) {
  return (
    <div className="rounded-md border border-kraft-300 bg-cream p-3">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Service mode
        </h3>
        <p className="text-xs italic text-ink-soft">
          {serviceModeDescription(mode)}
        </p>
      </div>
      <div
        role="radiogroup"
        aria-label="Service mode"
        className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {MODES.map((m) => {
          const active = m === mode;
          return (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(m)}
              className={
                "rounded-sm border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors " +
                (active
                  ? "border-leaf-700 bg-leaf-700 text-cream"
                  : "border-kraft-300 bg-paper text-ink-soft hover:border-kraft-500 hover:text-ink")
              }
            >
              {serviceModeLabel(m)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
