export type Promo =
  | { id: string; kind: "PERCENT_OFF"; percent: number }
  | { id: string; kind: "DOLLAR_OFF"; cents: number }
  | { id: string; kind: "BOGO"; sourceCategory: string; rewardCategory: string };

export type PromoValidation = { ok: true } | { ok: false; reason: string };
