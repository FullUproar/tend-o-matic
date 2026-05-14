export const LIMIT_DIMENSIONS = [
  "FLOWER_GRAMS",
  "CONCENTRATE_GRAMS",
  "INFUSED_MG_THC",
  "TOTAL_OUNCES",
  "IMMATURE_PLANTS",
] as const;
export type LimitDimension = (typeof LIMIT_DIMENSIONS)[number];

export const LIMIT_WINDOWS = [
  "TRANSACTION",
  "DAY",
  "FOURTEEN_DAYS",
  "MONTH",
] as const;
export type LimitWindow = (typeof LIMIT_WINDOWS)[number];

export type Limit = {
  dimension: LimitDimension;
  max: number;
  window: LimitWindow;
};

export type LimitStatus = {
  dimension: LimitDimension;
  window: LimitWindow;
  used: number;
  max: number;
  remaining: number;
};
