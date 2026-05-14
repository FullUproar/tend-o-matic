// A Source is a regulator-facing URL or feed we watch for changes.
// Source records are immutable once published; rule changes publish a
// new versioned source registry rather than mutating in place.
import type { Jurisdiction } from "@tend-o-matic/compliance";

export const SOURCE_CADENCES = [
  "daily",
  "daily-during-transition",
  "weekly",
  "weekly-during-rulemaking",
  "onboarding-then-quarterly",
] as const;
export type SourceCadence = (typeof SOURCE_CADENCES)[number];

export const SOURCE_SEVERITIES = [
  "low",
  "medium",
  "medium-high",
  "high",
  "urgent",
] as const;
export type SourceSeverity = (typeof SOURCE_SEVERITIES)[number];

export type Source = {
  // Stable code (kebab-case) for cross-referencing in alerts.
  code: string;
  jurisdiction: Jurisdiction | "CROSS";
  name: string;
  url: string;
  cadence: SourceCadence;
  severity: SourceSeverity;
  // Free-text notes used by the review queue, e.g. "watch for tag-
  // transition deadline updates".
  notes?: string;
};
