# Compliance Monitoring

> Source registry, monitoring cadence, and alert classification for regulatory change detection. Derived from `docs/sources/manus-2026-05-13/TendOMatic_Compliance_Monitoring_Source_Findings.md` and `TendOMatic_Cannabis_Compliance_Landscape_and_RealTime_Monitoring_Strategy.md`.

## Thesis

The compliance moat is not just a dated immutable ruleset — it is also the system that detects when the world changes and routes the change to the right product surface. Operational changes in cannabis often appear in agency bulletins, FAQs, newsletters, or recall notices before they appear in consolidated rule text. Tend-O-Matic monitors these channels and converts changes into ruleset proposals, customer notices, and engineering tickets.

## Source registry (v0)

The `packages/compliance-monitor` package exports a typed source registry seeded from the table below. Each source declares its URL, jurisdiction, cadence, and default alert severity.

### Michigan

| Source | URL | Cadence | Default severity |
|---|---|---|---|
| CRA homepage / resource hub | https://www.michigan.gov/cra | daily diff | medium-high |
| CRA News Releases | https://www.michigan.gov/cra/news-releases | daily | medium-urgent |
| CRA Bulletins | https://www.michigan.gov/cra/bulletins | daily | high |
| CRA Laws, Rules, and Other Resources | https://www.michigan.gov/cra/laws-rules-other | weekly; daily during active rulemaking | high |
| CRA Metrc page | https://www.michigan.gov/cra/resources/statewide-monitoring-system-information-metrc | daily | high |
| CRA disciplinary actions | (via CRA hub) | weekly | medium |

### Illinois

| Source | URL | Cadence | Default severity |
|---|---|---|---|
| CROO homepage | https://cannabis.illinois.gov/ | daily diff | medium-high |
| CROO Newsletters | https://cannabis.illinois.gov/media/newsletters.html | daily/weekly | high during seed-to-sale changes |
| CROO Press Releases | https://cannabis.illinois.gov/media/press-releases.html | daily | medium-urgent |
| IDFPR Adult Use Cannabis Program | https://idfpr.illinois.gov/profs/adultusecan.html | daily diff | high |
| Seed-to-sale / Metrc FAQs | https://cannabis.illinois.gov/research-and-data/seed-to-sale-faqs/retail-sales-seed-to-sale-faqs.html | daily during transition; weekly after | high |
| IDFPR / CROO laws and rules | (linked from above) | weekly | high |

### Cross-jurisdiction

| Source | URL | Cadence | Default severity |
|---|---|---|---|
| Metrc state-partner / API resources | https://www.metrc.com/ | daily / weekly | high |
| Local ordinances | (per-store profile) | onboarding + quarterly | medium-high |

## Alert classification

Every detected change is classified into a product-surface category. This is the bridge from monitoring to engineering work.

| Category code | Example trigger | Default owner action |
|---|---|---|
| `checkout-limit` | Purchase-limit number, equivalency, or transaction-cap change. | New ruleset proposal; tests; customer notice. |
| `id-age` | ID requirement or age-verification process change. | Update checkout prompt + training. |
| `medical-allotment` | Patient allotment lookup/process change. | Update medical workflow + integration tests. |
| `inventory-package` | Tag, receiving, transfer, waste, destruction change. | Update inventory workflows + reconciliation. |
| `metrc-api` | Endpoint, credential, submission, or outage change. | Engineering ticket + customer status note. |
| `product-eligibility` | COA / testing / labeling / recall / hold guidance. | New checkout block + inventory status flag. |
| `tax-receipt` | Excise, local tax, receipt content, reporting change. | Tax engine update + counsel/accountant review. |
| `agent-license` | Agent training, employee credential change. | Employee-module reminder + admin warning. |
| `enforcement-pattern` | Disciplinary action reveals recurring failure mode. | Add pre-flight checks / warnings. |
| `local-ordinance` | Store-specific hours, signage, local approval. | Store profile update + customer-specific alert. |

## Alert tiers

- **Tier 1 — informational.** No product change required; internal note only.
- **Tier 2 — affects product behavior or customer operations.** Creates engineering / compliance ticket; goes into next ruleset proposal cycle.
- **Tier 3 — urgent.** Triggers customer notification (recalls, mandatory deadlines, system outages, immediate rule changes). Surfaced in-app to managers and via the operator's chosen notification channel.

## Workflow shape (Phase 1+)

Not built yet. The shape is:

1. Daily scheduled fetch captures source page text / PDFs / linked docs.
2. Snapshots are diffed against the prior snapshot.
3. Diffs are classified (category × tier) and routed into an internal review queue.
4. Tier 2/3 items become ruleset proposals or engineering tickets; Tier 1 items are summarized in the weekly internal digest.
5. Tier 3 items trigger customer-facing notices in the manager dashboard, including source link, effective date, affected state, affected module, and plain-English operational impact.

In v0, the `packages/compliance-monitor` package ships only the typed source registry and the category/tier types. No fetcher, no diff engine, no notifier.
