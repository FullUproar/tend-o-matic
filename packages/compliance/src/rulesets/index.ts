import { MI_2026_05_14 } from "./mi-2026-05-14";
import { IL_2026_05_14 } from "./il-2026-05-14";
import type { Ruleset } from "../ruleset";
import type { Jurisdiction } from "../jurisdiction";

export const ALL_RULESETS: ReadonlyArray<Ruleset> = [MI_2026_05_14, IL_2026_05_14];

export function findRulesetEffectiveOn(
  jurisdiction: Jurisdiction,
  isoDate: string,
): Ruleset | null {
  for (const r of ALL_RULESETS) {
    if (r.jurisdiction !== jurisdiction) continue;
    if (r.effectiveFrom > isoDate) continue;
    if (r.effectiveTo !== null && r.effectiveTo <= isoDate) continue;
    return r;
  }
  return null;
}

export { MI_2026_05_14, IL_2026_05_14 };
