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

      // Limit math intentionally not implemented in v0.1. Until then,
      // applying a line item that would otherwise be eligible succeeds
      // only in environments where limit-math gates are inactive
      // ("secondary-cite-only"). In production (counsel-verified), the
      // guardRuleset call above prevents reaching this point with rules
      // that lack counsel-verified limit math — because the limits
      // block carries its own provenance and would lower the effective
      // status below threshold.
      return {
        ok: true,
        cart: { ...cart, lines: [...cart.lines, item] },
      };
    },

    checkLimits(cart) {
      const ruleGuard = guardRuleset(cart.ruleset, env);
      if (ruleGuard) return { ok: false, reason: ruleGuard };
      // Stub: limit math depends on counsel-verified equivalencies +
      // limits. Returns empty status array under sufficient verification;
      // refuses under insufficient. Real implementation lands in PR-N
      // when counsel signs the dossier.
      return { ok: true, statuses: [] };
    },

    computeTaxes(cart) {
      const ruleGuard = guardRuleset(cart.ruleset, env);
      if (ruleGuard) return { ok: false, reason: ruleGuard };
      // Tax block is entirely TODO in the dossier; this method always
      // refuses until tax values are populated and counsel-verified.
      return {
        ok: false,
        reason: {
          code: "RULESET_INSUFFICIENT_VERIFICATION",
          required: "counsel-verified",
          actual: "todo",
        },
      };
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
