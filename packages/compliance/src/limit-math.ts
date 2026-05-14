import type { Cart, LineItem } from "./cart";
import type { Limit, LimitDimension } from "./limit";
import type { CategoryEquivalency, EquivalencyTable } from "./equivalency";
import type { RefusalReason } from "./refusal";
import type { CustomerKind } from "./customer";
import type { Ruleset } from "./ruleset";
import { toGrams } from "./weight";

const GRAMS_PER_OUNCE = 28.3495;

// Canonical unit per dimension. The kernel sums contributions in these
// units and compares to the dimension's limit value (which is also in
// these units). Conversion happens at routing time.
//
//   TOTAL_OUNCES     → ounces (limit values in oz)
//   FLOWER_GRAMS     → grams
//   CONCENTRATE_GRAMS→ grams
//   INFUSED_MG_THC   → mg THC
//   IMMATURE_PLANTS  → unit count

// Compute one line item's contribution to each tracked limit dimension.
// Returns either a per-dimension contribution map or a refusal reason.
export function lineItemContribution(
  item: LineItem,
  table: EquivalencyTable,
):
  | { ok: true; contributions: Map<LimitDimension, number> }
  | { ok: false; reason: RefusalReason } {
  const eq: CategoryEquivalency | undefined = table[item.category];
  if (!eq) {
    return {
      ok: false,
      reason: { code: "EQUIVALENCY_UNDEFINED", category: item.category },
    };
  }

  const contributions = new Map<LimitDimension, number>();
  const wantsMgThc = eq.categoryDimension === "INFUSED_MG_THC";
  const wantsPlantUnits = eq.categoryDimension === "IMMATURE_PLANTS";

  if (wantsMgThc) {
    if (item.weight.unit !== "MG_THC") {
      return {
        ok: false,
        reason: {
          code: "WEIGHT_UNIT_INCOMPATIBLE",
          packageId: item.packageId,
          providedUnit: item.weight.unit,
          expectedUnit: "MG_THC",
        },
      };
    }
    contributions.set("INFUSED_MG_THC", item.weight.value * item.qty);
    return { ok: true, contributions };
  }

  if (wantsPlantUnits) {
    if (item.weight.unit !== "UNITS") {
      return {
        ok: false,
        reason: {
          code: "WEIGHT_UNIT_INCOMPATIBLE",
          packageId: item.packageId,
          providedUnit: item.weight.unit,
          expectedUnit: "UNITS",
        },
      };
    }
    contributions.set("IMMATURE_PLANTS", item.weight.value * item.qty);
    return { ok: true, contributions };
  }

  // Remaining shapes: contributions denominated in grams (toward
  // TOTAL_OUNCES via the equivalency factor, and/or toward a gram-
  // denominated category dimension at factor 1).
  if (item.weight.unit !== "G" && item.weight.unit !== "OZ") {
    return {
      ok: false,
      reason: {
        code: "WEIGHT_UNIT_INCOMPATIBLE",
        packageId: item.packageId,
        providedUnit: item.weight.unit,
        expectedUnit: "G",
      },
    };
  }
  const lineGrams = toGrams(item.weight) * item.qty;

  if (eq.gramsPerGramAgainstTotalOunces > 0) {
    const equivalentGrams = lineGrams * eq.gramsPerGramAgainstTotalOunces;
    contributions.set("TOTAL_OUNCES", equivalentGrams / GRAMS_PER_OUNCE);
  }
  if (
    eq.categoryDimension === "FLOWER_GRAMS" ||
    eq.categoryDimension === "CONCENTRATE_GRAMS"
  ) {
    contributions.set(eq.categoryDimension, lineGrams);
  }
  return { ok: true, contributions };
}

// Sum contributions across the cart plus the candidate line item.
// Returns per-dimension totals or the first refusal encountered.
export function cartContributions(
  cart: Cart,
  candidate: LineItem | null,
):
  | { ok: true; totals: Map<LimitDimension, number> }
  | { ok: false; reason: RefusalReason } {
  const totals = new Map<LimitDimension, number>();
  const all = candidate ? [...cart.lines, candidate] : [...cart.lines];
  for (const line of all) {
    const r = lineItemContribution(line, cart.ruleset.equivalencies);
    if (!r.ok) return r;
    for (const [dim, value] of r.contributions) {
      totals.set(dim, (totals.get(dim) ?? 0) + value);
    }
  }
  return { ok: true, totals };
}

// Find any limit applicable to this customer whose window is not yet
// implemented. Returns the first offender or null.
export function findUnimplementedWindow(
  customerKind: CustomerKind,
  ruleset: Ruleset,
): Limit | null {
  const applicable = ruleset.limitsByCustomerKind[customerKind] ?? [];
  for (const limit of applicable) {
    if (limit.window !== "TRANSACTION") return limit;
  }
  return null;
}

// Evaluate transaction-window limits against the cart's contributions.
// Returns null if all transaction limits pass; otherwise the first
// LIMIT_EXCEEDED refusal encountered.
export function checkTransactionLimits(
  customerKind: CustomerKind,
  ruleset: Ruleset,
  totals: Map<LimitDimension, number>,
): RefusalReason | null {
  const applicable = ruleset.limitsByCustomerKind[customerKind] ?? [];
  for (const limit of applicable) {
    if (limit.window !== "TRANSACTION") continue;
    const used = totals.get(limit.dimension) ?? 0;
    if (used > limit.max) {
      return {
        code: "LIMIT_EXCEEDED",
        dimension: limit.dimension,
        window: limit.window,
        would: used,
        max: limit.max,
      };
    }
  }
  return null;
}
