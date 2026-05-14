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

### Counsel review questions (introduced by round-2 / M1.1)

These are interpretive calls the round-2 dossier (`docs/sources/manus-2026-05-13-round-2/`) raised when populating the equivalency table and medical limits. The encoded values remain `secondary-cite-only`; counsel signoff promotes them to `counsel-verified` or substitutes alternative interpretations.

- [ ] **MI-Q1 (A1):** Do the MCL 333.26424 equivalency ratios (a MEDICAL marihuana act) govern MRTMA ADULT-USE transactions? Manus found no direct CRA/MRTMA cite confirming. **Largest single counsel question gating production.**
- [ ] **MI-Q2 (A1):** Concentrate is NOT a "marihuana-infused product" in MCL 333.26424. Does it roll up to the 2.5 oz total at factor 1, or at a different ratio? Statute is silent; we encoded 1:1 conservatively.
- [ ] **MI-Q3 (A3):** Day/month boundary semantics for medical limits — calendar day vs 24-hour rolling? Manus could not extract. Encoded calendar-DAY.
- [ ] **MI-Q4 (A1):** INFUSED, TOPICAL `ProductCategory` are intentionally NOT mapped in the equivalency table because the equivalency ratio depends on FORM (solid 1:16 / gaseous 1:7 by mass / liquid 1:36 by fluid volume). Until the category enum is split or `LineItem` carries a `form` field, the kernel refuses these with `EQUIVALENCY_UNDEFINED`.
- [ ] **IL-Q1 (B3):** June 2025 CROO doc states 21.3 g THC equivalency for vapes/concentrates against the 14-day cap; Sept 22 2025 CROO doc states 26.6 g. Encoded the newer value (26.6 g / 26,600 mg). Counsel must confirm which is current.
- [ ] **IL-Q2 (B2):** "Cumulative" phrasing in CROO FAQs is ambiguous (per-category caps vs combined cap). Encoded as INDEPENDENT per-category caps, which is the standard CRTA reading.
- [ ] **IL-Q3 (B2):** Package-level 100 mg THC and per-serving 10 mg THC caps are product-catalog validations, not cart-level. Will be enforced at product ingest in M3.
- [ ] **MI-Q5 (A4):** Tax rounding policy — per-line vs per-subtotal. Manus did not extract a Treasury rule. Encoded as `rounding: "TODO"` in the MI tax block; tax engine accepts both modes but the choice gates production correctness (cents drift across thousands of sales).
- [ ] **MI-Q6 (A4):** Sales-tax base interpretation. Round-2 Product-Implications text says "the sales tax is applied to the subtotal after the excise tax has been added" — encoded as `base: SUBTOTAL_PLUS_PRIOR_STATE_TAX`. Confirm Treasury writeup matches this reading.
- [ ] **IL-Q4 (B4):** Adjusted-THC computation timing. Encoded as a per-LineItem attribute (`adjustedThcPct`) sourced from the lab COA at product ingest (M3). Counsel should confirm the POS is permitted to rely on the lab-certified value rather than recompute.

### Status updates from M1.1 (2026-05-14)

Round-2 (`manus-2026-05-13`) closed the equivalency, caregiver, and medical 14-day window TODOs:

| Item | Old status | New status | Counsel-Q ref |
|---|---|---|---|
| MI category equivalency ratios (FLOWER, PRE_ROLL, CONCENTRATE, EDIBLE, IMMATURE_PLANT) | `todo` | `secondary-cite-only` | MI-Q1, MI-Q2 |
| MI medical caregiver per-patient limits (2.5 oz + 12 plants per connected patient) | `todo` | `secondary-cite-only` (limit math in M1.2) | — |
| IL adult-use per-category caps (encoded, equivalency table maps category → own dimension) | `secondary-cite-only` | (clarified — independent per-category, not roll-up) | IL-Q2 |
| IL medical 14-day window limits (70.87 g flower / 26.6 g THC / 26.6 g concentrate) | `todo` | `secondary-cite-only` | IL-Q1 |
| Equivalency provenance (both fixtures) | `todo` | `secondary-cite-only` | — |

INFUSED, TOPICAL (MI), IMMATURE_PLANT (IL), and OTHER (both) remain unmapped — the kernel refuses these with `EQUIVALENCY_UNDEFINED` until the form-discriminator question (MI-Q4) is resolved.

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

Source: MCL 333.26424 (Michigan Medical Marihuana Act §4). The statute defines that 1 oz of usable marihuana is equivalent to 16 oz of solid marihuana-infused product, 7 g of gaseous marihuana-infused product, or 36 fl oz of liquid marihuana-infused product. Round-2 applies these to MRTMA adult-use transactions on the secondary-citation reading — see **MI-Q1** above.

| Product category | Roll-up factor toward TOTAL_OUNCES | Category-specific dimension | Status | Source chain |
|---|---|---|---|---|
| FLOWER | 1 g flower = 1 g of "usable" | (none) | `secondary-cite-only` | manus-2026-05-13 → MCL 333.26424 |
| PRE_ROLL | 1 g pre-roll = 1 g of "usable" | (none) | `secondary-cite-only` | manus-2026-05-13 → MCL 333.26424 |
| CONCENTRATE | 1 g concentrate = 1 g (conservative, **MI-Q2**) | `CONCENTRATE_GRAMS` (15 g sub-cap) | `secondary-cite-only` | manus-2026-05-13 → R. 420.506 + MCL 333.26424 |
| EDIBLE (solid infused) | 1 g edible = 1/16 g (factor 0.0625) | (none) | `secondary-cite-only` | manus-2026-05-13 → MCL 333.26424 |
| IMMATURE_PLANT | 0 (no weight contribution) | `IMMATURE_PLANTS` (3 plant transaction cap) | `secondary-cite-only` | manus-2026-05-13 → R. 420.506 |
| INFUSED | UNMAPPED — gaseous (1:7) vs liquid (1:36) need a `form` field | — | `todo` (counsel-Q4) | manus-2026-05-13 |
| TOPICAL | UNMAPPED — statute silent on roll-up | — | `todo` (counsel-Q4) | — |
| OTHER | UNMAPPED — never enabled by design | — | (never mapped) | — |

Encoded in `packages/compliance/src/rulesets/mi-2026-05-14.ts`. The kernel refuses any line item whose `ProductCategory` is not in this table with `EQUIVALENCY_UNDEFINED`.

### Product eligibility (MI)

| Rule | Value | Status | Source chain |
|---|---|---|---|
| Source restriction | Retailer may buy/receive only from licensed marijuana establishments | `secondary-cite-only` | manus-2026-05-13 → Cornell LII (R. 420.104) |
| Test requirement | Retail product must have been tested | `secondary-cite-only` | manus-2026-05-13 → Cornell LII (R. 420.104) |
| Label requirement | Must bear required retail-sale label | `secondary-cite-only` | manus-2026-05-13 → Cornell LII (R. 420.104) |
| Recall / hold handling | TODO — Manus flagged as open | `todo` | — |

### Taxes (MI)

Source: round-2 A4 (manus-2026-05-13 → michigan.gov/treasury + MCL 333.27963).

| Rule | Value | Status | Source chain |
|---|---|---|---|
| Marijuana Retailers Excise (MRE) | 10% of retail subtotal, adult-use only (medical patients exempt per MMFLA). Eff. 2018-12-06. | `secondary-cite-only` | manus-2026-05-13 → "About the Marijuana Retailers Excise (MRE) Tax" (michigan.gov/treasury) |
| State sales tax | 6% applied to (subtotal + MRE) — stacked. Applies to all customers. | `secondary-cite-only` | manus-2026-05-13 → michigan.gov/treasury |
| Local municipal cannabis tax | Per-tenant config supplied via `cart.localTaxes` at runtime. Not in ruleset. | (tenant config) | — |
| Patient/caregiver tax exemption | MMFLA-licensed patients exempt from MRE. Encoded via `excludeCustomerKinds: ["MI_MED_PATIENT"]`. | `secondary-cite-only` | manus-2026-05-13 → MMFLA |
| Rounding rules (per-line vs subtotal) | **TODO — counsel-Q MI-Q5** | `todo` | — |
| Wholesale Marijuana Tax (24% eff. 2026-01-01) | OUT OF SCOPE for retail dispensary POS — applies only to wholesale-only transactions between licensed establishments. | (out-of-scope) | — |

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
| Patient usable-cannabis allotment | 2.5 oz (70.87 g) usable per **rolling 14 days** | `secondary-cite-only` | manus-2026-05-13 (round-2 B3) → 410 ILCS 130/10 |
| Vape / concentrate THC equivalency | 26.6 g THC over rolling 14 days (per **2025-09-22 CROO**; June 2025 said 21.3 g — **IL-Q1**) | `secondary-cite-only` | manus-2026-05-13 (round-2 B3) → CROO "Medical Cannabis Limits, Explained" |
| Concentrate equivalency | 26.6 g over rolling 14 days | `secondary-cite-only` | manus-2026-05-13 (round-2 B3) |
| Per-day / per-month patient limits | n/a — IL medical uses a **rolling 14-day window**, not calendar day/month | (clarified) | manus-2026-05-13 (round-2 B3) |
| Caregiver rules | Caregiver "assists no more than one patient"; full purchase mechanics for minor-patient flow still partial | `secondary-cite-only` (partial) | manus-2026-05-13 (round-2 B3) |

### Category equivalency (IL)

IL adult-use limits are **independent per-category** (no roll-up to total ounces); each category maps to its own LimitDimension. See **IL-Q2** for the "cumulative" phrasing ambiguity.

| Product category | Mapped dimension | Notes | Source chain |
|---|---|---|---|
| FLOWER | `FLOWER_GRAMS` | Resident 30 g / non-resident 15 g per transaction | manus-2026-05-13 → 410 ILCS 705/10-10 |
| PRE_ROLL | `FLOWER_GRAMS` | Same dimension as flower (weight in grams) | (same) |
| CONCENTRATE | `CONCENTRATE_GRAMS` | Resident 5 g / non-resident 2.5 g | (same) |
| INFUSED | `INFUSED_MG_THC` | Resident 500 mg / non-resident 250 mg per transaction. Package cap 100 mg THC, per-serving 10 mg THC (enforced at product ingest, M3 — **IL-Q3**) | (same) |
| EDIBLE | `INFUSED_MG_THC` | Treated as infused for limit purposes | (same) |
| TOPICAL | `INFUSED_MG_THC` | CRTA treats topicals as infused | (same) |
| IMMATURE_PLANT | UNMAPPED — IL has no adult-use home grow | — | — |
| OTHER | UNMAPPED — never enabled | — | — |

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

### Taxes (IL)

Source: round-2 B4 (manus-2026-05-13 → tax.illinois.gov + 410 ILCS 705/65).

| Rule | Value | Status | Source chain |
|---|---|---|---|
| Cannabis Purchaser Excise — non-infused, adj. THC ≤ 35% | 10% per-line on retail price. Applies to FLOWER, PRE_ROLL, CONCENTRATE (incl. vapes per B4). | `secondary-cite-only` | manus-2026-05-13 → 410 ILCS 705/65 + tax.illinois.gov cannabis page |
| Cannabis Purchaser Excise — non-infused, adj. THC > 35% | 25% per-line. | `secondary-cite-only` | (same) |
| Cannabis Purchaser Excise — infused | 20% per-line. Applies to INFUSED, EDIBLE, TOPICAL. | `secondary-cite-only` | (same) |
| Medical exemption from excise | IL_MED_PATIENT exempt from Cannabis Purchaser Excise. Encoded via `excludeCustomerKinds`. | `secondary-cite-only` | manus-2026-05-13 → 410 ILCS 705/65 |
| State Retailers' Occupation Tax (ROT) — adult-use | 6.25% of subtotal. | `secondary-cite-only` | manus-2026-05-13 → tax.illinois.gov |
| State Retailers' Occupation Tax — medical | 1% (qualifying-drug rate) of subtotal. Encoded as separate rate with `onlyCustomerKinds: ["IL_MED_PATIENT"]`. | `secondary-cite-only` | manus-2026-05-13 → tax.illinois.gov |
| Local cannabis tax caps | ≤3% municipal + ≤3.75% county (unincorp.) / 3% county (incorp.). Specific rates per-tenant config, not in ruleset. | (tenant config; statutory caps `secondary-cite-only`) | manus-2026-05-13 → 410 ILCS 705 |
| Adjusted-THC formula | Δ9-THC% + 0.877 × THCA%. Per-product attribute (`adjustedThcPct` on LineItem); product catalog (M3) must capture from lab COA. Counsel-Q IL-Q4. | `secondary-cite-only` | manus-2026-05-13 → 410 ILCS 705/65 |

### Receipts, returns, voids, promo (IL)

All TODO. Awaiting M1.4.

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
