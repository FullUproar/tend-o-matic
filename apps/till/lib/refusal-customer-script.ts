// Customer-facing scripts for every kernel refusal code. The
// budtender can read these aloud verbatim or hand the tablet over,
// so the language is second-person ("Michigan requires"), frames
// every restriction as compliance rather than store policy, and
// offers a path forward when one exists. This is the textual half
// of the brand promise "compliance without confrontation."
//
// Companion to refusal-text.ts — that function speaks to the
// budtender; this one speaks to the customer. They share the same
// RefusalReason union and stay in sync via TypeScript's
// exhaustiveness check.

import type { RefusalReason } from "@tend-o-matic/compliance";

export type CustomerScript = {
  // One-line opener the budtender reads first. Should explain the
  // situation in plain language without sounding accusatory.
  headline: string;
  // Optional context — the specific rule or amount in play.
  body?: string;
  // Optional forward path: substitute product, alternate channel,
  // manager intervention. Omitted when nothing actionable is left.
  suggestion?: string;
};

export function refusalToCustomerScript(r: RefusalReason): CustomerScript {
  switch (r.code) {
    case "AGE_BELOW_MINIMUM":
      return {
        headline: `Sorry — adult-use sales require you to be ${r.min} or older.`,
        body: r.actual !== null
          ? `Your ID shows you're ${r.actual}.`
          : `We weren't able to confirm your age from your ID.`,
        suggestion: `If you have a different ID with a verifiable date of birth, I'm happy to take another look.`,
      };

    case "ID_NOT_VERIFIED":
      return {
        headline: `Before I can ring you up, I need to verify your ID.`,
        body: `Michigan requires us to check ID on every adult-use sale — no exceptions, even for regulars.`,
        suggestion: `Could I see a state-issued ID?`,
      };

    case "PRODUCT_NOT_TESTED":
      return {
        headline: `This package hasn't cleared lab testing yet, so I can't sell it.`,
        body: `Michigan requires every package to have a passing lab result on file before it goes out the door.`,
        suggestion: `Let me grab you a tested batch of the same product — give me a second.`,
      };

    case "PRODUCT_NOT_LABELED":
      return {
        headline: `This package is missing its required compliance label.`,
        body: `Every cannabis package has to leave the store with a state-mandated label. This one's not labeled yet.`,
        suggestion: `Let me grab a labeled one for you.`,
      };

    case "PRODUCT_RECALLED":
      return {
        headline: `This batch is currently under recall — I can't sell it.`,
        body: `The state issued a recall on this specific batch. Recalls are non-negotiable on our end.`,
        suggestion: `Let me find you the next batch over — same product, different lot.`,
      };

    case "LIMIT_EXCEEDED": {
      const over = r.would - r.max;
      const unit = unitForDimension(r.dimension);
      const dimText = humanDimensionPlain(r.dimension);
      const windowText = humanWindowPlain(r.window);
      return {
        headline: `This cart would put us over Michigan's ${dimText} limit ${windowText}.`,
        body: `The cap is ${formatAmount(r.max, unit)}; this cart is at ${formatAmount(r.would, unit)} — that's ${formatAmount(over, unit)} over.`,
        suggestion: `Want me to drop a package, swap to a smaller size, or split this into two visits?`,
      };
    }

    case "MEDICAL_PATIENT_NOT_VERIFIED":
      return {
        headline: `Before I can apply medical pricing, I need to verify your patient registry.`,
        body: `Michigan requires we confirm the medical card against the state registry on every medical sale.`,
        suggestion: `Give me a second to pull that up.`,
      };

    case "MEDICAL_CAREGIVER_NOT_LINKED":
      return {
        headline: `This caregiver card isn't currently linked to a registered patient.`,
        body: `For a caregiver-served patient sale, the state requires an active patient-caregiver link in the registry.`,
        suggestion: `Could you check with the patient about the registry status, then come back?`,
      };

    case "EQUIVALENCY_UNDEFINED":
      return {
        headline: `I can't sell this category right now — our compliance team is finalizing how it counts against state limits.`,
        body: `I know that's frustrating. We don't want to guess on a rule that could put your card or our license at risk.`,
        suggestion: `Want me to suggest something in a category we have cleared?`,
      };

    case "RULESET_INSUFFICIENT_VERIFICATION":
      return {
        headline: `Sorry — we can't run sales right now while our compliance team finalizes an update.`,
        body: `This is on our end, not yours. We should be back online shortly.`,
        suggestion: `Want me to take your number and call when we're back up?`,
      };

    case "JURISDICTION_MISMATCH":
      return {
        headline: `Your ID is from a state we don't currently serve under this license.`,
        body: `Michigan adult-use sales are open to any adult with a valid government ID, so this is unusual — let me grab my manager to take a look.`,
      };

    case "LIMIT_WINDOW_NOT_IMPLEMENTED":
      return {
        headline: `I can't complete this medical transaction right now — a piece of our system is still being finalized.`,
        body: `This is on our end, not yours. Adult-use sales are still working normally.`,
        suggestion: `Either I can switch this to an adult-use sale, or let me grab my manager.`,
      };

    case "WEIGHT_UNIT_INCOMPATIBLE":
      return {
        headline: `There's a data mismatch on this package — I can't sell it as scanned.`,
        body: `Looks like the weight unit on the package doesn't match what the state tracks for this category. We need to fix it before it can go out.`,
        suggestion: `Let me grab my manager to sort it out, or pick a different package.`,
      };

    case "TAX_INPUT_MISSING":
      return {
        headline: `This product is missing some required lab info, so I can't run it until that's added.`,
        body: `Illinois ties the tax rate to the lab-tested THC percentage, and this package doesn't have that on file yet.`,
        suggestion: `Want me to find an equivalent that's ready to ring up?`,
      };
  }
}

// Render a CustomerScript as a single string for read-aloud or
// clipboard-copy use. Joined with newlines so a tablet display can
// render it as a paragraph and a clipboard paste preserves the
// structure.
export function customerScriptToText(s: CustomerScript): string {
  return [s.headline, s.body, s.suggestion].filter(Boolean).join("\n\n");
}

// Plain-English versions of the kernel dimension/window codes for
// customer-facing copy. Differs from refusal-text.ts's versions
// because those target the budtender — "flower (grams)" reads fine
// to a trained eye but is jargon to a customer.
function humanDimensionPlain(d: string): string {
  switch (d) {
    case "TOTAL_OUNCES":
      return "total flower-equivalent";
    case "FLOWER_GRAMS":
      return "flower";
    case "CONCENTRATE_GRAMS":
      return "concentrate";
    case "INFUSED_MG_THC":
      return "infused-product THC";
    case "IMMATURE_PLANTS":
      return "immature-plant";
    default:
      return d.toLowerCase().replace(/_/g, " ");
  }
}

function humanWindowPlain(w: string): string {
  switch (w) {
    case "TRANSACTION":
      return "per visit";
    case "DAY":
      return "per day";
    case "FOURTEEN_DAYS":
      return "in the 14-day window";
    case "MONTH":
      return "this month";
    default:
      return w.toLowerCase();
  }
}

function unitForDimension(d: string): "oz" | "g" | "mg" | "units" {
  if (d === "TOTAL_OUNCES") return "oz";
  if (d === "INFUSED_MG_THC") return "mg";
  if (d === "IMMATURE_PLANTS") return "units";
  return "g";
}

function formatAmount(n: number, unit: string): string {
  if (unit === "oz") return `${n.toFixed(2)} oz`;
  if (unit === "g") return `${n.toFixed(1)} g`;
  if (unit === "mg") return `${Math.round(n)} mg`;
  return `${n} ${unit}`;
}
