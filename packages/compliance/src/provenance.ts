// Verification status taxonomy. Mirrors docs/compliance-dossier.md.
export const VERIFICATION_STATUSES = [
  "todo",
  "secondary-cite-only",
  "agency-confirmed",
  "counsel-verified",
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

// Higher number = stronger verification.
const RANK: Record<VerificationStatus, number> = {
  todo: 0,
  "secondary-cite-only": 1,
  "agency-confirmed": 2,
  "counsel-verified": 3,
};

export function meetsThreshold(
  actual: VerificationStatus,
  required: VerificationStatus,
): boolean {
  return RANK[actual] >= RANK[required];
}

export type SourceCitation = {
  // e.g. "manus", "michigan.gov", "cornell-lii", "counsel:<firm>".
  provider: string;
  // ISO date the citation was captured / signed off.
  date: string;
  // Free-text citation, e.g. "Mich Admin Code R. 420.506 (single-transaction limit)".
  cite: string;
  // Optional URL to the source as captured.
  url?: string;
};

export type Provenance = {
  status: VerificationStatus;
  sources: ReadonlyArray<SourceCitation>;
  // Free-text counsel note, populated only when status is counsel-verified.
  counselNote?: string;
};

export function lowestStatus(provenances: ReadonlyArray<Provenance>): VerificationStatus {
  let lowest: VerificationStatus = "counsel-verified";
  for (const p of provenances) {
    if (RANK[p.status] < RANK[lowest]) lowest = p.status;
  }
  return lowest;
}
