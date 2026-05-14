export const PRODUCT_CATEGORIES = [
  "FLOWER",
  "CONCENTRATE",
  "INFUSED",
  "EDIBLE",
  "PRE_ROLL",
  "TOPICAL",
  "IMMATURE_PLANT",
  "OTHER",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
