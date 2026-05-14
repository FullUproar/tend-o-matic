import type { Provenance } from "./provenance";

// Scenarios under which a jurisdiction permits a sale to be returned.
// Round-2 A6 (MI) / B6 (IL) extract very narrow lists for cannabis returns
// compared to general retail.
export const RETURN_SCENARIOS = [
  "ADVERSE_REACTION",
  "DEFECTIVE",
  "EXPIRED",
  "MISLABELED",
  "RECALL",
] as const;
export type ReturnScenario = (typeof RETURN_SCENARIOS)[number];

export type ReturnPolicy = {
  // Whitelist of scenarios that permit a return at all. Anything not in
  // this list is refused at the manager-override stage.
  permittedScenarios: ReadonlyArray<ReturnScenario>;
  // Whether the dispensary is permitted to resell returned product.
  // Currently FALSE for both MI and IL — returned product is destroyed.
  mayResell: boolean;
  // Maximum days the dispensary may hold returned product before it
  // must be destroyed/wasted. Null means no time limit specified.
  destroyWithinDays: number | null;
  // Whether delivery drivers may accept returns at the point of delivery.
  // MI explicitly prohibits this per R. 420.214c.
  driverAcceptsReturns: boolean;
  // Action the dispensary must take in the seed-to-sale system after a
  // return is accepted (free-text for now; M9 monitor + M3 backoffice
  // surfaces this).
  seedToSaleAction: string;
  // Days within which the return must be entered into the state
  // verification system (IL: 5 cal days per CRTA §15-90 / 1291.320).
  // Null means no external-system reporting deadline specified.
  externalReportWithinDays: number | null;
  // Free-text notes (e.g., "Expired product may be returned to processor").
  notes: ReadonlyArray<string>;
  provenance: Provenance;
};
