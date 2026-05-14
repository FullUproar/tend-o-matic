export const JURISDICTIONS = ["MI", "IL"] as const;
export type Jurisdiction = (typeof JURISDICTIONS)[number];

export function isJurisdiction(x: unknown): x is Jurisdiction {
  return typeof x === "string" && (JURISDICTIONS as readonly string[]).includes(x);
}
