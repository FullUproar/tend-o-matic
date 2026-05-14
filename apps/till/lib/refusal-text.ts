// Translates kernel refusal codes into budtender-readable English.
// The kernel never produces prose — that lives here, on the UI side,
// so the same refusal can be rendered differently in budtender mode
// vs expert/compliance mode vs receipt text.

import type { RefusalReason } from "@tend-o-matic/compliance";

export function refusalToText(r: RefusalReason): string {
  switch (r.code) {
    case "AGE_BELOW_MINIMUM":
      return `Customer is under the minimum age of ${r.min}.`;
    case "ID_NOT_VERIFIED":
      return "ID has not been verified for this transaction.";
    case "PRODUCT_NOT_TESTED":
      return `Package ${r.packageId} has no valid test result on file.`;
    case "PRODUCT_NOT_LABELED":
      return `Package ${r.packageId} is missing a compliant label.`;
    case "PRODUCT_RECALLED":
      return `Package ${r.packageId} is under recall — cannot be sold.`;
    case "LIMIT_EXCEEDED": {
      const over = r.would - r.max;
      const unit = unitForDimension(r.dimension);
      return `This would exceed the ${humanDimension(r.dimension)} limit by ${formatAmount(over, unit)} (${humanWindow(r.window)}).`;
    }
    case "MEDICAL_PATIENT_NOT_VERIFIED":
      return "Medical patient registry has not been verified.";
    case "MEDICAL_CAREGIVER_NOT_LINKED":
      return "Caregiver is not linked to a qualifying patient for this transaction.";
    case "EQUIVALENCY_UNDEFINED":
      return `No equivalency rule for category ${r.category} in this jurisdiction. Counsel input required.`;
    case "RULESET_INSUFFICIENT_VERIFICATION":
      return `Active ruleset is at ${r.actual}; this environment requires ${r.required}.`;
    case "JURISDICTION_MISMATCH":
      return `Customer jurisdiction (${r.customerJurisdiction}) does not match ruleset (${r.rulesetJurisdiction}).`;
    case "LIMIT_WINDOW_NOT_IMPLEMENTED":
      return `Limit window ${r.window} for ${humanDimension(r.dimension)} is not yet enforced by the kernel. Medical transactions are temporarily refused.`;
    case "WEIGHT_UNIT_INCOMPATIBLE":
      return `Package ${r.packageId} weight is in ${r.providedUnit} but this jurisdiction tracks ${r.expectedUnit} for the category.`;
    case "TAX_INPUT_MISSING":
      return `Cannot compute tax: package ${r.packageId} is missing ${r.missingField}.`;
  }
}

function humanDimension(d: string): string {
  switch (d) {
    case "TOTAL_OUNCES":
      return "total weight (oz)";
    case "FLOWER_GRAMS":
      return "flower (grams)";
    case "CONCENTRATE_GRAMS":
      return "concentrate (grams)";
    case "INFUSED_MG_THC":
      return "infused THC (mg)";
    case "IMMATURE_PLANTS":
      return "immature plants";
    default:
      return d.toLowerCase().replace(/_/g, " ");
  }
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

function unitForDimension(d: string): "oz" | "g" | "mg" | "units" {
  if (d === "TOTAL_OUNCES") return "oz";
  if (d === "INFUSED_MG_THC") return "mg";
  if (d === "IMMATURE_PLANTS") return "units";
  return "g";
}

function formatAmount(n: number, unit: string): string {
  if (unit === "oz") return `${n.toFixed(3)} oz`;
  if (unit === "g") return `${n.toFixed(2)} g`;
  if (unit === "mg") return `${Math.round(n)} mg`;
  return `${n} ${unit}`;
}
