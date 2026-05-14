// Alert classification: every detected diff is routed into a (category x
// tier) cell that maps to a product surface and an operational
// response.
export const ALERT_CATEGORIES = [
  "checkout-limit",
  "id-age",
  "medical-allotment",
  "inventory-package",
  "metrc-api",
  "product-eligibility",
  "tax-receipt",
  "agent-license",
  "enforcement-pattern",
  "local-ordinance",
  "general",
] as const;
export type AlertCategory = (typeof ALERT_CATEGORIES)[number];

export const ALERT_TIERS = [
  "tier-1-informational",
  "tier-2-product-change",
  "tier-3-urgent",
] as const;
export type AlertTier = (typeof ALERT_TIERS)[number];

export type Alert = {
  id: string;
  sourceCode: string;
  diffSourceUrl: string;
  category: AlertCategory;
  tier: AlertTier;
  detectedAt: string;
  // Human-written one-paragraph operational impact summary, produced
  // by the review-queue triage step. v0.1 only declares the shape.
  operationalImpact?: string;
  // ISO date the change becomes / became effective, when known.
  effectiveAt?: string;
};
