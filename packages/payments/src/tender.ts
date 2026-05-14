// Tender types we support. Card networks (Stripe / Square / Visa /
// Mastercard) are deliberately absent: cannabis is federally scheduled
// and they are not options.
export const TENDER_TYPES = ["CASH", "CASHLESS_ATM", "ACH", "OTHER"] as const;
export type TenderType = (typeof TENDER_TYPES)[number];
