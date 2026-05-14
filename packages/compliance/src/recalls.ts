import type { Provenance } from "./provenance";

export type RecallPolicy = {
  // How quickly the dispensary must notify regulators after detecting
  // a recall (or being notified of one). MI: 1 business day. IL: 24 hr.
  notifyRegulatorsWithinHours: number;
  // Which agencies must be notified. IL recalls go to IDFPR + IDOA + DPH.
  // MI recalls go to CRA only.
  notifyAgencies: ReadonlyArray<string>;
  // Minimum hours recalled product must be quarantined before destruction.
  // IL: ≥72 hr per 68 Ill. Adm. Code 1291.330. MI: not specified in
  // round-2; left null.
  quarantineMinHours: number | null;
  // Days within which to destroy recalled product. MI: 90 days. IL: per
  // §15-90 (no explicit numeric in round-2 extract).
  destroyWithinDays: number | null;
  // Whether the recall must be recorded in the seed-to-sale system
  // (Metrc / SVS) before destruction can occur. Both MI and IL: true.
  systemEntryRequiredBeforeDestruction: boolean;
  // Whether the dispensary must verify no hold/recall on every package
  // before sale (MI explicit requirement per R. 420.214b).
  preSaleHoldCheckRequired: boolean;
  // Metrc adverse-event submenu name (MI uses "Patient" menu for both
  // adult-use and medical adverse responses, per round-2 A10). Null
  // means the jurisdiction doesn't use Metrc-side adverse-event flow.
  metrcAdverseEventMenu: string | null;
  notes: ReadonlyArray<string>;
  provenance: Provenance;
};
