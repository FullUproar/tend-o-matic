"use client";

// Live headroom indicator: shows the cashier where the cart sits
// against every applicable limit, color-coded by % used. Renders only
// when the customer has at least one limit defined for this ruleset.

import type { Cart } from "@tend-o-matic/compliance";
import { cartHeadroom } from "@tend-o-matic/compliance";

type Props = {
  cart: Cart;
};

function humanDimension(d: string): string {
  switch (d) {
    case "TOTAL_OUNCES":
      return "Total";
    case "FLOWER_GRAMS":
      return "Flower";
    case "CONCENTRATE_GRAMS":
      return "Concentrate";
    case "INFUSED_MG_THC":
      return "Infused THC";
    case "IMMATURE_PLANTS":
      return "Plants";
    default:
      return d.toLowerCase().replace(/_/g, " ");
  }
}

function unitFor(d: string): string {
  if (d === "TOTAL_OUNCES") return "oz";
  if (d === "INFUSED_MG_THC") return "mg";
  if (d === "IMMATURE_PLANTS") return "";
  return "g";
}

function formatAmount(n: number, dim: string): string {
  const unit = unitFor(dim);
  if (dim === "TOTAL_OUNCES") return `${n.toFixed(2)} ${unit}`;
  if (dim === "INFUSED_MG_THC") return `${Math.round(n)} ${unit}`;
  if (dim === "IMMATURE_PLANTS") return `${Math.round(n)}`;
  return `${n.toFixed(1)} ${unit}`;
}

function humanWindow(w: string): string {
  switch (w) {
    case "TRANSACTION":
      return "per transaction";
    case "DAY":
      return "per day";
    case "FOURTEEN_DAYS":
      return "per 14-day window";
    case "MONTH":
      return "per month";
    default:
      return w.toLowerCase();
  }
}

// Tone bands: under-half is green, comfortable. Half-to-75 is mustard,
// pacing warning. 75+ is clay, almost-out warning. > 100% would be red
// but the kernel refuses before getting there for TRANSACTION limits.
function toneFor(pct: number): { fill: string; track: string; text: string } {
  if (pct >= 1.0) {
    return {
      fill: "bg-danger",
      track: "bg-clay-300",
      text: "text-danger",
    };
  }
  if (pct >= 0.75) {
    return {
      fill: "bg-clay-500",
      track: "bg-clay-300",
      text: "text-clay-700",
    };
  }
  if (pct >= 0.5) {
    return {
      fill: "bg-mustard-500",
      track: "bg-mustard-300",
      text: "text-ink",
    };
  }
  return {
    fill: "bg-leaf-700",
    track: "bg-leaf-300",
    text: "text-leaf-700",
  };
}

export function HeadroomBar({ cart }: Props) {
  const rows = cartHeadroom(cart);
  if (rows.length === 0) return null;

  return (
    <div className="rounded-md border border-kraft-300 bg-cream p-3">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Headroom
        </h3>
      </div>
      <ul className="mt-2 space-y-2">
        {rows.map((row, i) => {
          if (row.priorUsageNeeded) {
            return (
              <li
                key={`${row.dimension}-${row.window}-${i}`}
                className="rounded-sm border border-dashed border-kraft-300 px-2 py-1 text-xs text-ink-soft"
              >
                <span className="font-medium">{humanDimension(row.dimension)}</span>{" "}
                · {formatAmount(row.max, row.dimension)} {humanWindow(row.window)}
                <span className="ml-2 italic">
                  (day/month enforcement pending)
                </span>
              </li>
            );
          }
          const tone = toneFor(row.percentUsed);
          const pctWidth = Math.min(1, row.percentUsed) * 100;
          return (
            <li key={`${row.dimension}-${row.window}-${i}`}>
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-medium">
                  {humanDimension(row.dimension)}
                </span>
                <span className={`font-mono ${tone.text}`}>
                  {formatAmount(row.used, row.dimension)} /{" "}
                  {formatAmount(row.max, row.dimension)} ·{" "}
                  {formatAmount(row.remaining, row.dimension)} left
                </span>
              </div>
              <div
                className={`mt-1 h-2 w-full overflow-hidden rounded-full ${tone.track}`}
                role="progressbar"
                aria-valuenow={Math.round(row.percentUsed * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${humanDimension(row.dimension)} ${Math.round(row.percentUsed * 100)}% used`}
              >
                <div
                  className={`h-full ${tone.fill} transition-all`}
                  style={{ width: `${pctWidth}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
