import type { Cart, LineItem } from "./cart";
import type { LimitStatus } from "./limit";
import type { Ruleset } from "./ruleset";
import type { RefusalReason } from "./refusal";
import type { TaxBreakdown } from "./tax";
import type { ReceiptContent } from "./receipt";
import type { Promo, PromoValidation } from "./promo";
import { meetsThreshold, type VerificationStatus, type Provenance } from "./provenance";
import { customerJurisdiction } from "./customer";
import { lowestStatus } from "./provenance";
import {
  cartContributions,
  checkTransactionLimits,
  findUnimplementedWindow,
} from "./limit-math";
import { computeTaxBreakdown } from "./tax-engine";

export type ApplyResult =
  | { ok: true; cart: Cart }
  | { ok: false; reason: RefusalReason };

export type LimitsResult =
  | { ok: true; statuses: ReadonlyArray<LimitStatus> }
  | { ok: false; reason: RefusalReason };

export type ComputeTaxesResult =
  | { ok: true; taxes: TaxBreakdown }
  | { ok: false; reason: RefusalReason };

export type RenderReceiptResult =
  | { ok: true; receipt: ReceiptContent }
  | { ok: false; reason: RefusalReason };

export type KernelEnv = {
  // Minimum verification status the kernel will accept for a ruleset's
  // weakest rule before applying any line items. Production sets this
  // to "counsel-verified"; dev/test can run on "secondary-cite-only".
  requireRulesetStatus: VerificationStatus;
};

export interface ComplianceKernel {
  applyLineItem(cart: Cart, item: LineItem): ApplyResult;
  checkLimits(cart: Cart): LimitsResult;
  computeTaxes(cart: Cart): ComputeTaxesResult;
  renderReceipt(cart: Cart): RenderReceiptResult;
  validatePromo(cart: Cart, promo: Promo): PromoValidation;
}

// rulesetEffectiveStatus returns the weakest provenance status across the
// rule blocks whose values would actually be applied. An empty block
// contributes no values; its trustworthiness is moot and is instead
// gated per-operation (e.g. EQUIVALENCY_UNDEFINED at line-apply time).
export function rulesetEffectiveStatus(r: Ruleset): VerificationStatus {
  const provenances: Provenance[] = [
    r.provenance,
    r.adultUseMinAge.provenance,
    r.limitsProvenance,
  ];
  if (Object.keys(r.equivalencies).length > 0) {
    provenances.push(r.equivalenciesProvenance);
  }
  return lowestStatus(provenances);
}

function guardRuleset(r: Ruleset, env: KernelEnv): RefusalReason | null {
  const actual = rulesetEffectiveStatus(r);
  if (!meetsThreshold(actual, env.requireRulesetStatus)) {
    return {
      code: "RULESET_INSUFFICIENT_VERIFICATION",
      required: env.requireRulesetStatus,
      actual,
    };
  }
  return null;
}

function guardJurisdiction(cart: Cart): RefusalReason | null {
  const cj = customerJurisdiction(cart.customer);
  if (cj !== cart.ruleset.jurisdiction) {
    return {
      code: "JURISDICTION_MISMATCH",
      customerJurisdiction: cj,
      rulesetJurisdiction: cart.ruleset.jurisdiction,
    };
  }
  return null;
}

// makeKernel returns a kernel parameterized by environment. The v0.1
// kernel implements only the universal guards (verification status,
// jurisdiction match, product-eligibility flags, ID-verified on adult-
// use). The actual limit math, tax math, receipt rendering, and promo
// validation are deliberately not implemented — those depend on
// counsel-verified ruleset values that don't exist yet, and an
// unimplemented method is safer than an under-implemented one.
export function makeKernel(env: KernelEnv): ComplianceKernel {
  return {
    applyLineItem(cart, item) {
      const ruleGuard = guardRuleset(cart.ruleset, env);
      if (ruleGuard) return { ok: false, reason: ruleGuard };

      const jurGuard = guardJurisdiction(cart);
      if (jurGuard) return { ok: false, reason: jurGuard };

      if (item.recalled) {
        return {
          ok: false,
          reason: { code: "PRODUCT_RECALLED", packageId: item.packageId },
        };
      }
      if (!item.tested) {
        return {
          ok: false,
          reason: { code: "PRODUCT_NOT_TESTED", packageId: item.packageId },
        };
      }
      if (!item.labeled) {
        return {
          ok: false,
          reason: { code: "PRODUCT_NOT_LABELED", packageId: item.packageId },
        };
      }

      const isAdultUse =
        cart.customer.kind === "MI_ADULT_USE" ||
        cart.customer.kind === "IL_ADULT_USE_RESIDENT" ||
        cart.customer.kind === "IL_ADULT_USE_NONRESIDENT";
      if (isAdultUse && !cart.idVerified) {
        return { ok: false, reason: { code: "ID_NOT_VERIFIED" } };
      }

      // Equivalency must exist for any category the cart is going to
      // consume. If counsel has not signed off on this category's
      // equivalency, refuse. (No silent passes.)
      if (!cart.ruleset.equivalencies[item.category]) {
        return {
          ok: false,
          reason: { code: "EQUIVALENCY_UNDEFINED", category: item.category },
        };
      }

      // Limit math: M1.2 implements TRANSACTION-window limits only.
      // Customers whose applicable limits include any non-TRANSACTION
      // window (DAY, MONTH, FOURTEEN_DAYS) refuse with a clear code
      // until a future PR threads PriorUsage into the kernel.
      const unimplemented = findUnimplementedWindow(
        cart.customer.kind,
        cart.ruleset,
      );
      if (unimplemented) {
        return {
          ok: false,
          reason: {
            code: "LIMIT_WINDOW_NOT_IMPLEMENTED",
            dimension: unimplemented.dimension,
            window: unimplemented.window,
          },
        };
      }

      const contrib = cartContributions(cart, item);
      if (!contrib.ok) return { ok: false, reason: contrib.reason };

      const exceeded = checkTransactionLimits(
        cart.customer.kind,
        cart.ruleset,
        contrib.totals,
      );
      if (exceeded) return { ok: false, reason: exceeded };

      return {
        ok: true,
        cart: { ...cart, lines: [...cart.lines, item] },
      };
    },

    checkLimits(cart) {
      const ruleGuard = guardRuleset(cart.ruleset, env);
      if (ruleGuard) return { ok: false, reason: ruleGuard };

      const unimplemented = findUnimplementedWindow(
        cart.customer.kind,
        cart.ruleset,
      );
      if (unimplemented) {
        return {
          ok: false,
          reason: {
            code: "LIMIT_WINDOW_NOT_IMPLEMENTED",
            dimension: unimplemented.dimension,
            window: unimplemented.window,
          },
        };
      }

      const contrib = cartContributions(cart, null);
      if (!contrib.ok) return { ok: false, reason: contrib.reason };

      const applicable = cart.ruleset.limitsByCustomerKind[cart.customer.kind] ?? [];
      const statuses: LimitStatus[] = [];
      for (const limit of applicable) {
        if (limit.window !== "TRANSACTION") continue;
        const used = contrib.totals.get(limit.dimension) ?? 0;
        statuses.push({
          dimension: limit.dimension,
          window: limit.window,
          used,
          max: limit.max,
          remaining: Math.max(0, limit.max - used),
        });
      }
      return { ok: true, statuses };
    },

    computeTaxes(cart) {
      const ruleGuard = guardRuleset(cart.ruleset, env);
      if (ruleGuard) return { ok: false, reason: ruleGuard };
      const r = computeTaxBreakdown(cart);
      if (!r.ok) return { ok: false, reason: r.reason };
      return { ok: true, taxes: r.breakdown };
    },

    renderReceipt(cart) {
      const ruleGuard = guardRuleset(cart.ruleset, env);
      if (ruleGuard) return { ok: false, reason: ruleGuard };
      return {
        ok: false,
        reason: {
          code: "RULESET_INSUFFICIENT_VERIFICATION",
          required: "counsel-verified",
          actual: "todo",
        },
      };
    },

    validatePromo(_cart, _promo) {
      return { ok: false, reason: "promo validation not implemented in v0.1" };
    },
  };
}
