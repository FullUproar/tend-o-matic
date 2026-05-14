export const WEIGHT_UNITS = ["G", "OZ", "MG_THC", "UNITS"] as const;
export type WeightUnit = (typeof WEIGHT_UNITS)[number];

export type Weight = { value: number; unit: WeightUnit };

const GRAMS_PER_OUNCE = 28.3495;

// Pure unit conversion. Refuses cross-dimension conversions (you cannot
// convert MG_THC to grams without an equivalency rule — that lives in
// equivalency.ts, not here).
export function toGrams(w: Weight): number {
  if (w.unit === "G") return w.value;
  if (w.unit === "OZ") return w.value * GRAMS_PER_OUNCE;
  throw new Error(
    `toGrams: cannot convert ${w.unit} to grams without an equivalency rule`,
  );
}

export function toOunces(w: Weight): number {
  if (w.unit === "OZ") return w.value;
  if (w.unit === "G") return w.value / GRAMS_PER_OUNCE;
  throw new Error(
    `toOunces: cannot convert ${w.unit} to ounces without an equivalency rule`,
  );
}
