# Compliance Dossier (v0)

> **Status:** v0 skeleton. **Every concrete value below is `TODO — verify
> against current Michigan CRA rules before implementation.`** Do not
> populate factual values without verifying against authoritative, dated,
> primary source material (CRA rules, METRC for Michigan spec, Michigan
> Compiled Laws). Do not approximate. This is a comply-or-die system.
>
> When a value is verified and entered, it must carry: (a) the primary
> source citation, (b) the effective date the value applies on, and (c) the
> ruleset version that encodes it. Old rulesets are immutable.

## Open items requiring research before any implementation

- [ ] Replace `[TBD entity]` in `LICENSE` with the legal operating entity
      (Open decision in project brief).
- [ ] Confirm METRC sandbox and production credential acquisition path with
      the launch partner.
- [ ] Confirm every value in every section below from CRA primary sources,
      with effective date and citation.
- [ ] Confirm equivalency-ratio math and limit-aggregation rules with a
      cannabis-licensed Michigan attorney before encoding in the kernel.

## Customer types

- Adult-use
- Medical — patient
- Medical — registered caregiver (purchasing on behalf of linked patient(s))
- TODO — verify ID, registry-card, and proof-of-linkage requirements per
  type against current CRA rules before implementation.

## Taxes

- TODO — state cannabis excise rate for adult-use: verify with current
  CRA rules before implementation.
- TODO — sales tax application to adult-use vs medical: verify with current
  CRA rules before implementation.
- TODO — local municipality cannabis tax mechanics (which jurisdictions,
  on what base, at what rate): verify before implementation.
- TODO — patient exemption rules (sales tax, excise, local): verify before
  implementation.
- TODO — rounding rules (per-line vs subtotal, half-even vs half-up):
  verify before implementation.

## Purchase limits and category equivalencies

- TODO — daily and per-transaction limits per customer type: verify before
  implementation.
- TODO — category equivalency ratios (flower / concentrate / edibles /
  infused / other): verify before implementation.
- TODO — limit aggregation rules across categories and across transactions
  within a day: verify before implementation.
- TODO — reset / day-boundary semantics (calendar day in store's local
  time, or some other clock?): verify before implementation.

## METRC operations

- TODO — required fields submitted to METRC for sales receipts: verify
  against current METRC for Michigan spec before implementation.
- TODO — timing requirements for receipt submission and corrections:
  verify before implementation.
- TODO — void / refund / return mechanics in METRC: verify before
  implementation.
- TODO — manifest receive flow and required adjustments / discrepancy
  reporting: verify before implementation.
- TODO — transfer outgoing (returns to supplier, destruction): verify
  before implementation.
- TODO — package adjustment categories and required justifications:
  verify before implementation.

## Receipt requirements

- TODO — required fields on a CRA-compliant printed receipt: verify before
  implementation.
- TODO — required fields specific to medical receipts (patient ID number,
  caregiver, tax breakdown): verify before implementation.
- TODO — retention requirements (digital, printed, both): verify before
  implementation.
- TODO — receipt-copy access for the customer post-purchase (privacy /
  PHI considerations): verify before implementation.

## Promo / discount rules

- TODO — which discount mechanics are CRA-permitted (BOGO, % off, $ off,
  loyalty redemption, employee discount): verify before implementation.
- TODO — restrictions on advertised pricing vs. in-store discount: verify
  before implementation.
- TODO — rules on free product, samples, charity giveaways: verify before
  implementation.
- TODO — rules on loyalty points accrual and redemption (especially
  cross-customer-type): verify before implementation.

## ID and age verification

- TODO — minimum age for adult-use purchase: verify before implementation.
- TODO — acceptable forms of ID and required fields read: verify before
  implementation.
- TODO — re-verification cadence (every visit / first visit / time-window):
  verify before implementation.
- TODO — record retention of scanned ID data and PII minimization
  requirements: verify before implementation.

## Patient and caregiver verification

- TODO — registry-card verification process and any required online check:
  verify before implementation.
- TODO — caregiver-to-patient linkage rules and per-day caregiver
  purchase limits: verify before implementation.
- TODO — handling of expired or suspended cards: verify before
  implementation.
- TODO — PHI handling, storage, and access-log requirements: verify before
  implementation.

## Returns and voids

- TODO — permitted return / exchange scenarios and time windows: verify
  before implementation.
- TODO — disposition of returned product (destruction vs. restock) and
  who authorizes: verify before implementation.
- TODO — METRC reporting on returns and voids (which API operations,
  what timing): verify before implementation.
- TODO — refund tendering rules (original tender vs. cash, refund of tax):
  verify before implementation.

## Audit requirements

- TODO — minimum retention period for sales records: verify before
  implementation.
- TODO — required immutable fields on every sale audit row: verify before
  implementation.
- TODO — manager-override audit fields and retention: verify before
  implementation.
- TODO — surveillance / camera footage retention (cross-reference only —
  not in scope for this software system): verify before implementation.
