# Compliance Dossier (v0.1)

> **Status:** v0.1 — populated with cited values from `docs/sources/manus-2026-05-13/`. **No value in this dossier is approved for production use.** Every encoded rule must be re-verified against its primary source by a Michigan- or Illinois-licensed cannabis attorney and stamped `counsel-verified` before any production ruleset references it. The compliance kernel will refuse to load a ruleset whose verification status is below the environment's required threshold (production: `counsel-verified`; dev/test: `secondary-cite-only` permitted).
>
> **This document is not legal advice.**

## Verification status taxonomy

Every value below carries a status flag:

| Status | Meaning | OK for |
|---|---|---|
| `agency-confirmed` | Quoted from the official agency page or rule text we have pulled directly. | dev, test, staging |
| `secondary-cite-only` | Sourced via secondary publication (Cornell LII, Justia, Manus AI research). The cited primary regulation has not yet been re-pulled by us. | dev, test only |
| `counsel-verified` | A cannabis attorney licensed in the applicable state has reviewed the value and the primary citation, and signed off on the encoding interpretation. | production |
| `todo` | Value not yet researched. The kernel must refuse a ruleset that depends on a `todo` value. | nothing |

The encoded ruleset version records, per rule, the source chain and effective date as of the last update. Old rulesets are immutable: a sale on 2026-03-14 is forever evaluated against the ruleset in force on 2026-03-14.

## Source chain shorthand

`manus-2026-05-13 → Cornell LII (Mich Admin Code R. 420.506) → claimed primary (Michigan rule text)` reads as: Manus AI produced the value on 2026-05-13, citing Cornell LII's secondary publication of R. 420.506, which itself claims fidelity to the primary Michigan rule text we have not yet re-pulled.

Manus research files are archived verbatim under `docs/sources/manus-2026-05-13/`.

## Open items that block `counsel-verified` status

- [ ] Engage Michigan cannabis attorney to verify every Michigan value below.
- [ ] Engage Illinois cannabis attorney to verify every Illinois value below.
- [ ] Engage Indiana cannabis counsel for entity / operating posture review (see `docs/indiana-entity-risk.md`).
- [ ] Re-pull primary text from `michigan.gov` (R. 420.104, R. 420.506, and rules covering taxes, receipts, returns, recalls, equivalencies).
- [ ] Re-pull primary text from `ilga.gov` (CRTA / 410 ILCS 705) and the Illinois Administrative Code for transaction-level limits, taxes, receipts, returns, recalls.
- [ ] Confirm METRC sandbox credential acquisition path with launch partner.
- [ ] Confirm operating entity formation jurisdiction (Indiana flag — see entity-risk doc).
- [ ] Confirm launch partner identity and locality so local-tax encoding can be scoped.

## Jurisdiction coverage in v0.1

- **Michigan (`MI`)** — launch target. Adult-use + medical (patient + caregiver) in scope.
- **Illinois (`IL`)** — second launch target. Adult-use (resident + non-resident split) + medical in scope; BioTrack→Metrc transition adds receiving/transition complexity.

Indiana (`IN`) is **not** a sales jurisdiction (prohibition state). It is referenced only as the likely operating-entity location, which is a separate posture decision documented in `docs/indiana-entity-risk.md`.

---

## MICHIGAN — `jurisdiction: MI`

### Customer types (MI)

| Type | Code | Notes | Status | Source chain |
|---|---|---|---|---|
| Adult-use | `ADULT_USE` | 21+ | `secondary-cite-only` | manus-2026-05-13 → Cornell LII (Mich Admin Code R. 420.104) |
| Medical patient | `MED_PATIENT` | Registry card holder. PHI handling required. | `secondary-cite-only` | manus-2026-05-13 → Cornell LII (Mich Admin Code R. 420.506) |
| Medical caregiver | `MED_CAREGIVER` | Purchases on behalf of linked qualifying patient(s). Per-patient day limit. | `secondary-cite-only` | manus-2026-05-13 → Cornell LII (R. 420.506) |

### Age and ID verification (MI)

| Rule | Value | Status | Source chain |
|---|---|---|---|
| Minimum age for adult-use sale | 21 | `secondary-cite-only` | manus-2026-05-13 → Cornell LII (R. 420.104) |
| ID requirement | Government-issued photographic identification with date of birth, verified before sale or transfer | `secondary-cite-only` | manus-2026-05-13 → Cornell LII (R. 420.104) |
| Re-verification cadence | TODO — Manus did not extract | `todo` | — |
| ID record retention / PII minimization | TODO — Manus did not extract | `todo` | — |

### Purchase limits (MI)

| Rule | Value | Status | Source chain |
|---|---|---|---|
| Adult-use single-transaction limit (total) | 2.5 ounces of marijuana | `secondary-cite-only` | manus-2026-05-13 → Cornell LII (R. 420.506) |
| Adult-use single-transaction concentrate cap | 15 grams of marijuana concentrate within the 2.5 oz total | `secondary-cite-only` | manus-2026-05-13 → Cornell LII (R. 420.506) |
| Adult-use single-transaction immature-plant cap | 3 immature plants | `secondary-cite-only` | manus-2026-05-13 → Cornell LII (R. 420.506) |
| Medical patient — per-day | 2.5 ounces of marijuana product or marijuana equivalent | `secondary-cite-only` | manus-2026-05-13 → Cornell LII (R. 420.506) |
| Medical patient — per-month | 10 ounces | `secondary-cite-only` | manus-2026-05-13 → Cornell LII (R. 420.506) |
| Medical caregiver — per-day per connected patient | 2.5 ounces | `secondary-cite-only` | manus-2026-05-13 → Cornell LII (R. 420.506) |
| Medical limit verification | Must be checked against statewide monitoring system (Metrc) at point of sale | `agency-confirmed` | michigan.gov/cra Metrc page |
| Day-boundary semantics (store-local time? calendar UTC?) | TODO | `todo` | — |

### Category equivalency ratios (MI)

| Rule | Value | Status | Source chain |
|---|---|---|---|
| Equivalent-unit conversion for concentrate, edibles, infused product against the 2.5 oz transaction cap | TODO — Manus did not extract the equivalency math. The 15 g concentrate cap is explicit, but how non-flower categories roll into the 2.5 oz total needs primary rule text. | `todo` | — |

**This is one of the highest-risk TODOs.** Without verified equivalencies, the cart cannot correctly enforce the 2.5 oz cap for mixed-category transactions. The compliance kernel must refuse to evaluate mixed-category carts under an `IL`/`MI` ruleset until this is populated and `counsel-verified`.

### Product eligibility (MI)

| Rule | Value | Status | Source chain |
|---|---|---|---|
| Source restriction | Retailer may buy/receive only from licensed marijuana establishments | `secondary-cite-only` | manus-2026-05-13 → Cornell LII (R. 420.104) |
| Test requirement | Retail product must have been tested | `secondary-cite-only` | manus-2026-05-13 → Cornell LII (R. 420.104) |
| Label requirement | Must bear required retail-sale label | `secondary-cite-only` | manus-2026-05-13 → Cornell LII (R. 420.104) |
| Recall / hold handling | TODO — Manus flagged as open | `todo` | — |

### Taxes (MI)

| Rule | Value | Status | Source chain |
|---|---|---|---|
| State cannabis excise rate (adult-use) | TODO — Manus did not extract | `todo` | — |
| Sales tax application by customer type | TODO | `todo` | — |
| Local municipality cannabis tax mechanics | TODO | `todo` | — |
| Patient/caregiver tax exemption rules | TODO | `todo` | — |
| Rounding rules (per-line vs subtotal) | TODO | `todo` | — |

### METRC operations (MI)

| Rule | Value | Status | Source chain |
|---|---|---|---|
| State seed-to-sale system | Metrc (statewide) | `agency-confirmed` | michigan.gov/cra Metrc page |
| Required fields submitted for sales receipt | TODO — depends on Metrc for Michigan spec | `todo` | — |
| Timing requirements for receipt submission | TODO | `todo` | — |
| Void / refund / return mechanics in Metrc | TODO | `todo` | — |
| Manifest receive flow specifics | TODO | `todo` | — |
| Package adjustment categories | TODO | `todo` | — |

### Receipt requirements (MI)

| Rule | Value | Status | Source chain |
|---|---|---|---|
| Required fields on CRA-compliant printed receipt | TODO | `todo` | — |
| Required fields specific to medical receipts | TODO | `todo` | — |
| Retention requirements | TODO | `todo` | — |

### Returns and voids (MI)

| Rule | Value | Status | Source chain |
|---|---|---|---|
| Permitted return / exchange scenarios | TODO | `todo` | — |
| Disposition of returned product (destruction vs restock) | TODO | `todo` | — |
| Metrc reporting on returns / voids | TODO | `todo` | — |
| Refund tendering rules (original tender vs cash; tax refund) | TODO | `todo` | — |

### Promo and discount rules (MI)

All TODO. CRA permitted discount mechanics, advertising-vs-in-store restrictions, free-product / employee-discount rules — none extracted by Manus.

---

## ILLINOIS — `jurisdiction: IL`

### Customer types (IL)

| Type | Code | Notes | Status | Source chain |
|---|---|---|---|---|
| Adult-use, Illinois resident | `ADULT_USE_RESIDENT` | 21+, IL state ID or proof of IL residency | `secondary-cite-only` | manus-2026-05-13 → CROO FAQ → CRTA |
| Adult-use, non-resident | `ADULT_USE_NONRESIDENT` | 21+, out-of-state ID | `secondary-cite-only` | manus-2026-05-13 → CROO FAQ → CRTA |
| Medical patient | `MED_PATIENT` | Allotment lookup via Metrc | `secondary-cite-only` | manus-2026-05-13 → CROO seed-to-sale FAQ |

### Age (IL)

| Rule | Value | Status | Source chain |
|---|---|---|---|
| Minimum age for adult-use sale | 21 | `secondary-cite-only` | manus-2026-05-13 → CROO FAQ → CRTA |

### Possession limits (IL)

> **Caution:** Manus extracted *possession* limits. Whether per-transaction limits are identical to possession limits, or differ (e.g., a single transaction may not include the full possession allowance, or vice versa), is **not yet verified**. The kernel will treat these as transaction limits until counsel resolves it, but must be re-checked.

| Rule | Resident value | Non-resident value | Status | Source chain |
|---|---|---|---|---|
| Cannabis flower | 30 g | 15 g | `secondary-cite-only` | manus-2026-05-13 → CROO FAQ → CRTA |
| Cannabis-infused product (by THC) | 500 mg THC | 250 mg THC | `secondary-cite-only` | manus-2026-05-13 → CROO FAQ → CRTA |
| Cannabis concentrate | 5 g | 2.5 g | `secondary-cite-only` | manus-2026-05-13 → CROO FAQ → CRTA |
| Transaction-level limit semantics (cumulative across categories?) | Cumulative by category, per Manus FAQ extract | (same) | `secondary-cite-only` | manus-2026-05-13 → CROO FAQ |
| Transaction vs possession limit reconciliation | TODO — verify against CRTA primary text and IL Admin Code | `todo` | — |

### Medical (IL)

| Rule | Value | Status | Source chain |
|---|---|---|---|
| Patient allotment lookup | Available in Metrc, including purchases from other dispensaries | `secondary-cite-only` | manus-2026-05-13 → CROO seed-to-sale FAQ |
| Per-day / per-month patient limits | TODO — Manus did not extract Illinois medical-specific limits | `todo` | — |
| Caregiver rules | TODO | `todo` | — |

### Product eligibility (IL)

| Rule | Value | Status | Source chain |
|---|---|---|---|
| COA / lab test results required for sale | Yes; valid test results recorded in BioTrack or Metrc | `secondary-cite-only` | manus-2026-05-13 → CROO seed-to-sale FAQ |
| Tagged packages required | Yes; all dispensary packages must have Metrc tags by transition deadline | `secondary-cite-only` | manus-2026-05-13 → CROO seed-to-sale FAQ |

### Seed-to-sale (IL — Metrc transition)

| Rule | Value | Status | Source chain |
|---|---|---|---|
| Current state | Transition from BioTrack to Metrc in progress (as of Manus 2026-05-13) | `secondary-cite-only` | manus-2026-05-13 → CROO seed-to-sale FAQ |
| Manifest acceptance semantics | Manifests can be partially accepted at the package level, but individual packages should generally be fully accepted or fully rejected | `secondary-cite-only` | manus-2026-05-13 → CROO seed-to-sale FAQ |
| Damaged-unit workflow | Accept the package, create a new tagged package for rejected/damaged units, manifest back or destroy | `secondary-cite-only` | manus-2026-05-13 → CROO seed-to-sale FAQ |
| Scanner / RFID | Inspectors carry scanners; dispensaries can use regular barcode or RFID | `secondary-cite-only` | manus-2026-05-13 → CROO seed-to-sale FAQ |

### Taxes, receipts, returns, voids, promo (IL)

All TODO. Manus did not extract Illinois-specific tax rates, receipt content, return/void mechanics, or promo restrictions.

---

## Audit requirements (cross-jurisdiction)

| Rule | Value | Status | Source chain |
|---|---|---|---|
| Minimum retention period for sales records | TODO | `todo` | — |
| Required immutable fields on every sale audit row | Defined by kernel: `sale_id`, `tenant_id`, `location_id`, `actor_user_id`, `customer_id?`, `ruleset_version`, `lines[]`, `totals`, `tender[]`, `created_at`, `metrc_outbox_id?`. | (kernel-defined) | this document |
| Manager-override audit fields | `override_id`, `requested_by_user_id`, `granted_by_manager_user_id`, `reason_code`, `phone_device_id`, `granted_at`. Override is itself an append-only row. | (kernel-defined) | this document |
| Surveillance / camera footage retention | Cross-reference only — not in scope for this software system | (out-of-scope) | — |

## Patient data handling (cross-jurisdiction)

Patient registry IDs, caregiver-to-patient linkages, and any limit-lookup responses are treated as PHI even where strict HIPAA does not apply. Storage requires encryption-at-rest; access is logged in `audit_log` as a primary write; export is gated behind manager + reason code; retention follows the strictest applicable state record-retention requirement once those are populated.

## How the kernel uses this dossier

Values are not loaded from this Markdown file at runtime. They are encoded in `packages/compliance/src/rulesets/` as typed TypeScript objects, each carrying the same source-chain + verification-status metadata, and indexed by `jurisdiction × effective_date`. This document is the **human-readable audit ledger** that explains where each encoded value came from and how confident we are in it. Drift between the encoded ruleset and this document is itself a compliance defect.
