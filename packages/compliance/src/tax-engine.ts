import type { Cart, LineItem } from "./cart";
import type { RefusalReason } from "./refusal";
import type {
  PerLineTax,
  TaxBreakdown,
  TaxLine,
  TaxRate,
  TaxRounding,
} from "./tax";

// Rounds a cents float toward the nearest integer cent (banker's rounding
// avoided in favor of standard half-up because cash registers do half-up).
function roundCents(amount: number): number {
  return Math.round(amount);
}

function rateAppliesToCustomer(
  rate: TaxRate,
  customerKind: string,
): boolean {
  if (rate.onlyCustomerKinds && !rate.onlyCustomerKinds.includes(customerKind as never)) {
    return false;
  }
  if (rate.excludeCustomerKinds && rate.excludeCustomerKinds.includes(customerKind as never)) {
    return false;
  }
  return true;
}

function rateAppliesToLine(
  rate: TaxRate,
  line: LineItem,
):
  | { applies: true }
  | { applies: false; refusal?: RefusalReason } {
  if (rate.onlyForCategories && !rate.onlyForCategories.includes(line.category)) {
    return { applies: false };
  }
  if (rate.thcCondition) {
    if (line.adjustedThcPct === undefined) {
      return {
        applies: false,
        refusal: {
          code: "TAX_INPUT_MISSING",
          packageId: line.packageId,
          missingField: "adjustedThcPct",
        },
      };
    }
    const ok =
      rate.thcCondition.op === "lte"
        ? line.adjustedThcPct <= rate.thcCondition.pct
        : line.adjustedThcPct > rate.thcCondition.pct;
    if (!ok) return { applies: false };
  }
  return { applies: true };
}

function lineTotalCents(line: LineItem): number {
  return line.unitPriceCents * line.qty;
}

function applyRounding(value: number, rounding: TaxRounding): number {
  if (rounding === "PER_LINE") return roundCents(value);
  return value;
}

// computeTaxBreakdown applies the cart's ruleset taxBlock + any local
// tax rates supplied via cart.localTaxes. Returns the breakdown or the
// first refusal encountered.
export function computeTaxBreakdown(
  cart: Cart,
):
  | { ok: true; breakdown: TaxBreakdown }
  | { ok: false; reason: RefusalReason } {
  const taxBlock = cart.ruleset.taxBlock;
  if (!taxBlock) {
    return {
      ok: false,
      reason: {
        code: "RULESET_INSUFFICIENT_VERIFICATION",
        required: "secondary-cite-only",
        actual: "todo",
      },
    };
  }

  const rounding = taxBlock.rounding;
  const customerKind = cart.customer.kind;

  // 1. Subtotal across all lines (no tax yet).
  const subtotalCents = cart.lines.reduce(
    (acc, l) => acc + lineTotalCents(l),
    0,
  );

  // 2. Evaluate ruleset rates in declared order, then local rates.
  const allRates: ReadonlyArray<TaxRate> = [
    ...taxBlock.rates,
    ...(cart.localTaxes ?? []),
  ];

  const taxLines: TaxLine[] = [];
  // Per-line attribution map: lineIndex → list of {code,label,amount}.
  // SUBTOTAL-based rates pro-rate across lines proportionally to each
  // line's contribution to the subtotal.
  const perLineMap = new Map<number, TaxLine[]>();
  const ensureLineEntries = (idx: number): TaxLine[] => {
    let arr = perLineMap.get(idx);
    if (!arr) {
      arr = [];
      perLineMap.set(idx, arr);
    }
    return arr;
  };
  let priorStateTaxCents = 0;

  for (const rate of allRates) {
    if (!rateAppliesToCustomer(rate, customerKind)) continue;

    let amount = 0;

    if (rate.base === "LINE_PRICE") {
      // Per-line attribution is exact: each line's tax is computed and
      // attributed individually.
      for (let i = 0; i < cart.lines.length; i++) {
        const line = cart.lines[i]!;
        const a = rateAppliesToLine(rate, line);
        if (!a.applies) {
          if (a.refusal) return { ok: false, reason: a.refusal };
          continue;
        }
        const lineTotal = lineTotalCents(line);
        const taxOnLine = applyRounding(lineTotal * rate.rate, rounding);
        amount += taxOnLine;
        if (roundCents(taxOnLine) > 0) {
          ensureLineEntries(i).push({
            code: rate.code,
            label: rate.label,
            amountCents: roundCents(taxOnLine),
          });
        }
      }
    } else if (rate.base === "SUBTOTAL") {
      // SUBTOTAL bases ignore line-level filters; they apply to the
      // full subtotal regardless of category/THC%.
      amount = subtotalCents * rate.rate;
      // Pro-rate per line by share of subtotal. Last line absorbs any
      // rounding remainder so the aggregate matches `amount` exactly.
      const rounded = roundCents(amount);
      let attributed = 0;
      for (let i = 0; i < cart.lines.length; i++) {
        const line = cart.lines[i]!;
        const isLast = i === cart.lines.length - 1;
        const share = isLast
          ? rounded - attributed
          : Math.round((rounded * lineTotalCents(line)) / Math.max(subtotalCents, 1));
        if (share > 0) {
          ensureLineEntries(i).push({
            code: rate.code,
            label: rate.label,
            amountCents: share,
          });
        }
        attributed += share;
      }
    } else if (rate.base === "SUBTOTAL_PLUS_PRIOR_STATE_TAX") {
      amount = (subtotalCents + priorStateTaxCents) * rate.rate;
      const rounded = roundCents(amount);
      let attributed = 0;
      for (let i = 0; i < cart.lines.length; i++) {
        const line = cart.lines[i]!;
        const isLast = i === cart.lines.length - 1;
        const share = isLast
          ? rounded - attributed
          : Math.round((rounded * lineTotalCents(line)) / Math.max(subtotalCents, 1));
        if (share > 0) {
          ensureLineEntries(i).push({
            code: rate.code,
            label: rate.label,
            amountCents: share,
          });
        }
        attributed += share;
      }
    }

    const rounded = roundCents(amount);
    if (rounded > 0) {
      taxLines.push({
        code: rate.code,
        label: rate.label,
        amountCents: rounded,
      });
      if (rate.code === "STATE_EXCISE" || rate.code === "STATE_SALES") {
        priorStateTaxCents += rounded;
      }
    }
  }

  const totalTaxCents = taxLines.reduce((a, l) => a + l.amountCents, 0);

  // Assemble per-line breakdown in input order.
  const perLine: PerLineTax[] = cart.lines.map((line, i) => {
    const taxes = perLineMap.get(i) ?? [];
    return {
      lineIndex: i,
      packageId: line.packageId,
      taxes,
      totalTaxCents: taxes.reduce((a, l) => a + l.amountCents, 0),
    };
  });

  return {
    ok: true,
    breakdown: {
      rulesetVersion: cart.ruleset.version,
      subtotalCents,
      lines: taxLines,
      perLine,
      totalTaxCents,
      grandTotalCents: subtotalCents + totalTaxCents,
    },
  };
}
