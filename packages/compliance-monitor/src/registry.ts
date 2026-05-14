import type { Source } from "./source";

// Seed registry derived from docs/compliance-monitoring.md and the
// Manus 2026-05-13 monitoring research. Phase 0 ships the registry as
// static data; later the registry can be moved to per-tenant DB rows
// if operators want to add their own local-ordinance sources.
export const SOURCE_REGISTRY: ReadonlyArray<Source> = [
  // Michigan
  {
    code: "mi-cra-home",
    jurisdiction: "MI",
    name: "Michigan CRA homepage / resource hub",
    url: "https://www.michigan.gov/cra",
    cadence: "daily",
    severity: "medium-high",
  },
  {
    code: "mi-cra-news",
    jurisdiction: "MI",
    name: "CRA News Releases",
    url: "https://www.michigan.gov/cra/news-releases",
    cadence: "daily",
    severity: "urgent",
    notes: "Recalls and enforcement narratives surface here first.",
  },
  {
    code: "mi-cra-bulletins",
    jurisdiction: "MI",
    name: "CRA Bulletins",
    url: "https://www.michigan.gov/cra/bulletins",
    cadence: "daily",
    severity: "high",
  },
  {
    code: "mi-cra-laws-rules",
    jurisdiction: "MI",
    name: "CRA Laws, Rules, and Other Resources",
    url: "https://www.michigan.gov/cra/laws-rules-other",
    cadence: "weekly-during-rulemaking",
    severity: "high",
  },
  {
    code: "mi-cra-metrc",
    jurisdiction: "MI",
    name: "CRA Statewide Monitoring System Information — Metrc",
    url: "https://www.michigan.gov/cra/resources/statewide-monitoring-system-information-metrc",
    cadence: "daily",
    severity: "high",
  },

  // Illinois
  {
    code: "il-croo-home",
    jurisdiction: "IL",
    name: "Illinois CROO homepage",
    url: "https://cannabis.illinois.gov/",
    cadence: "daily",
    severity: "medium-high",
  },
  {
    code: "il-croo-newsletters",
    jurisdiction: "IL",
    name: "CROO Newsletters",
    url: "https://cannabis.illinois.gov/media/newsletters.html",
    cadence: "daily-during-transition",
    severity: "high",
  },
  {
    code: "il-croo-press",
    jurisdiction: "IL",
    name: "CROO Press Releases",
    url: "https://cannabis.illinois.gov/media/press-releases.html",
    cadence: "daily",
    severity: "urgent",
  },
  {
    code: "il-idfpr-adultuse",
    jurisdiction: "IL",
    name: "IDFPR Adult Use Cannabis Program",
    url: "https://idfpr.illinois.gov/profs/adultusecan.html",
    cadence: "daily",
    severity: "high",
  },
  {
    code: "il-croo-seed-to-sale-faq",
    jurisdiction: "IL",
    name: "CROO Seed-to-Sale / Metrc FAQs",
    url: "https://cannabis.illinois.gov/research-and-data/seed-to-sale-faqs/retail-sales-seed-to-sale-faqs.html",
    cadence: "daily-during-transition",
    severity: "high",
  },

  // Cross-jurisdiction
  {
    code: "metrc-official",
    jurisdiction: "CROSS",
    name: "Metrc official site",
    url: "https://www.metrc.com/",
    cadence: "daily",
    severity: "high",
  },
];
