# MVP Roadmap

**Status:** draft 2026-05-14 (post-PR-#2-merge). Living document; revise on every milestone close.

## 1. MVP definition

**One Michigan-based store running real sales, multi-tenant-capable for additional MI stores.**

Optional intermediate state: same store running training-mode (fake) sales with real-sale code already merged, awaiting counsel sign-off. This costs ~nothing extra to support (Afterroar pattern: `tenant.training: boolean` flag suppresses METRC writes, payment provider charges, and inventory decrements) and is the recommended pre-counsel posture.

### In scope
- Till app (Android tablet PWA) running budtender flow end-to-end: login → scan/select product → cart → ID-check → kernel-gated checkout → payment → receipt → audit + METRC outbox.
- Backoffice app: inventory CRUD, sales report, manager refund/void, compliance alert surface, reconciliation queue.
- Portal app: super-admin tenant onboarding for additional MI stores.
- Compliance kernel running every sale, sourced from `secondary-cite-only` MI ruleset until counsel signs.
- Hardware drivers: barcode scanner, PDF417 ID reader, ESC/POS printer, cash drawer, NTEP scale.
- METRC-MI integration: outbox-drained, sandbox first, production-cert when launch partner provides credentials.
- Offline-first till: state A (online), state B (backend down, internet up), state C (fully offline) with explicit UX guardrails per Afterroar lessons.

### Out of scope for MVP
- Illinois. IL ruleset is encoded and kept in sync but no IL store launches in MVP.
- Card networks (federal scheduling). Cash, cashless ATM, ACH only.
- Delivery / curbside.
- Loyalty programs (compliance fuzzy on this; defer).
- Inter-store transfers (multi-store but each operates independently).
- Caregiver-served patient flow (MI fixture flags this as a known limitation).

## 2. Compliance-adaptive architecture (why this works without counsel)

Counsel verification is **a snapshot in time on a moving target**. The architecture must absorb regulatory drift without re-deploying code.

**Three architectural invariants protecting us from compliance churn:**

1. **Rulesets are data, not code.** Versioned, dated, immutable. A new CRA rule = a new ruleset row, not a new release. Today's ruleset has `secondary-cite-only` status; counsel signing it is a status-field flip, not a code change.
2. **Verification threshold is environment config, not application code.** `KernelEnv.requireRulesetStatus` is set per-env. Dev/test/training: `secondary-cite-only`. Production: `counsel-verified`. **Counsel sign-off is a config + status flip, not a build.**
3. **The compliance monitor (`packages/compliance-monitor`) runs continuously**, watching agency sources, flagging diffs for human review, publishing rules-release PRs that bump fixture versions. Counsel review on each release, not on each deploy.

This means we build everything in `secondary-cite-only` mode now. Real-sale code is identical to fake-sale code; only the environment switch differs. When counsel signs:
- They review the active ruleset's `secondary-cite-only` values.
- They author a `counsel-verified` ruleset block (could literally be a JSON patch + signed counsel-note).
- Production env flips `requireRulesetStatus` to `counsel-verified`.
- Real sales begin. No re-architecture, no rewrites.

**Important:** any kernel method whose math depends on a value the dossier flags as `todo` (e.g. MI day-boundary, IL local ROT) refuses operations even in `secondary-cite-only` mode. We do not guess. The `EQUIVALENCY_UNDEFINED` and `RULESET_INSUFFICIENT_VERIFICATION` refusal codes are first-class outputs — the UI surfaces them as "blocked: counsel input needed" rather than as engineering errors.

## 3. Critical-path non-engineering items

These can run in parallel with engineering. They do NOT gate any milestone except M11.

| Item | Status | Owner | Notes |
|---|---|---|---|
| Cannabis counsel engaged (MI + IL + IN) | open | Shawn | Round-2 dossier flags Benesch (Chicago) as best-aligned per Manus part C. Required for M11 only. |
| Entity formation (IN-based parent + per-state subsidiary per round-2 C3) | open | Shawn | LICENSE entity name stays `[TBD entity]` until decided. Not gating MVP code. |
| METRC-MI sandbox creds | open | Shawn / launch partner | Required to test M7 end-to-end. Until then `NotImplementedMetrcClient` continues throwing; outbox queues but doesn't drain. |
| Launch partner identified + locality known | open | Shawn | Required to encode local tax rates. Until then `taxes.local` is a per-tenant config (left empty in fixture). |
| Database provisioning (Neon / Vercel Postgres) | open | Shawn | Required for M2 onward. Per-app `DATABASE_URL` + separate `DATABASE_URL_ADMIN` for portal cross-tenant access (BYPASSRLS role). |
| Banking (Safe Harbor Financial per round-2 C1) | open | Shawn | Not gating code. Required before real cash flows. |

## 4. Milestones

Each milestone delivers a user-visible capability. PRs within a milestone may merge in any order; milestones themselves are roughly sequential except where noted.

### M1 — Kernel meaningfully usable (compliance unlock)
**Capability:** Kernel can evaluate a cart and refuse / accept lines with specific reason codes instead of always refusing on `EQUIVALENCY_UNDEFINED`.

| PR | Scope |
|---|---|
| M1.1 | Populate MI equivalency table from round-2 A1/A2 (1 oz usable = 16 oz solid infused = 7 g gaseous = 36 fl oz liquid; 15 g concentrate cap inside the 2.5 oz total). Encode caregiver per-patient rule (2.5 oz + 12 plants per connected patient). Same for IL B2/B3 (per-category cumulative caps, IL medical 14-day equivalency table — use 9-22-25 CROO values, flag June/Sept conflict). Bump `equivalenciesProvenance` to `secondary-cite-only`. |
| M1.2 | Implement kernel limit-math: weight rollup using equivalency table, window evaluation (TRANSACTION / DAY / MONTH), refusal with `LIMIT_EXCEEDED` carrying which dimension and by how much. Property tests over MI/IL cart shapes. |
| M1.3 | Tax engine fixtures. MI: MRE 10% on retail subtotal + 6% sales tax on (subtotal + MRE) — stacked order matters; medical exemption per MMFLA. IL: 10/20/25% excise tiers by THC content + ROT (6.25% adult-use, 1% medical) + local placeholders. Adjusted-THC formula. Counsel-flag: MI tax stacking order. |
| M1.4 | Receipts, returns, recalls data blocks on `Ruleset`. MI return rules (R. 420.214c — adverse/defective only, 90-day destroy, no driver returns, no resale). IL return rules (5-day SVS entry, no resale if seal/premises broken). Recall blocks (MI 1-business-day + Metrc, IL 24-hr 3-agency + 72-hr quarantine). Receipt content schemas. Promote `agency-confirmed` where Manus cited statute/admin code directly. |

**DoD:** Kernel-level integration test runs a complete cart (login → add lines → ID-verify → checkout → compute tax → render receipt) end-to-end with refusal codes that aren't `EQUIVALENCY_UNDEFINED` or `RULESET_INSUFFICIENT_VERIFICATION` unless the dossier values are genuinely todo. Property test suite covers MI + IL cart shapes.

**Counsel flag (M11 hand-off):** MI A1 equivalency (interpretive leap from MMMA to MRTMA), IL B3 vape THC conflict (June vs Sept 2025 CROO), MI tax stacking order, MI day-boundary semantics.

### M2 — Cart, checkout, ledger
**Capability:** Till app can render a working budtender flow against the kernel, completing a sale that writes ledger + audit + METRC outbox rows in one transaction. No hardware yet.

| PR | Scope |
|---|---|
| M2.1 | Cart model (ephemeral client state, no state machine): `Cart` type from kernel + reducer (`addLine`, `removeLine`, `setIdVerified`, `setCustomer`). Reducer wraps every mutation in a kernel call. |
| M2.2 | `Sale` model + `PosLedgerEntry`-style append-only table. Idempotency: client-generated `clientTxId` UUID; server unique on `(tenantId, deviceId, clientTxId)`. Sale completion writes ledger + audit + METRC outbox atomically (same Prisma transaction). |
| M2.3 | Payment provider interface (already typed in `packages/payments`). `CashProvider` works synchronously; cashless ATM and ACH throw `NotImplementedProviderError`. Split tender support (one ledger entry per tender method). |
| M2.4 | Receipt template (server-side render). ESC/POS-formatted monospace + HTML/email format. Compliance fields populated from kernel receipt block. Receipt number atomic counter per-tenant. |
| M2.5 | Till app: budtender flow UI. Login → ID-verify modal → product search → cart → checkout → payment → receipt. Touch-first (48px targets, no hover, dual-mode register/dashboard from Afterroar lesson 1). **Training mode toggle in tenant settings** suppresses METRC writes + inventory decrement; everything else runs identically. |

**DoD:** A user can run a fake sale on the till against in-memory product data, see the kernel either accept (and produce a receipt) or refuse with a human-readable reason. Audit log and METRC outbox both populated. Training-mode flag confirmed working.

**Reference:** Afterroar's `apps/ops/src/lib/payment.ts` (provider pattern), `pos_ledger_entries` model, `src/lib/receipt-template.ts`.

### M3 — Product catalog + inventory
**Capability:** Operator can manage product catalog in backoffice; sales decrement inventory; lot/batch-aware.

| PR | Scope |
|---|---|
| M3.1 | Product model with cannabis attributes: strain, harvest date, THC%, CBD%, lab COA reference, test status, label status, recall status. Lot/batch parent-child: `Product → Lot → Package`. Lot states: matured / quarantined / waste. |
| M3.2 | Inventory model: package-level qty tracking (cannabis is sold by Metrc package). Decrement on sale completion (not on cart add). Reservation pattern for in-progress carts (5-minute TTL). |
| M3.3 | Backoffice: product CRUD UI, lot management, manual inventory adjustment with reason + audit. |
| M3.4 | Barcode → package lookup. Scanner-learn flow (scan unknown UPC → ingest into catalog). |

**DoD:** A real Michigan-product catalog can be loaded, a sale decrements correctly, lot states surface in UI (quarantined product cannot be added to cart — kernel refuses with `PRODUCT_QUARANTINED`).

### M4 — Auth + device/user model
**Capability:** Operators authenticate; devices are bound to tenants; managers can PIN-override; staff cannot access cross-tenant data.

| PR | Scope |
|---|---|
| M4.1 | NextAuth (Google OAuth + credentials for staff). Session callback enriches with tenant, role, permissions per Afterroar pattern. |
| M4.2 | Role taxonomy (Owner, Manager, Budtender) + permission flags (already typed in `packages/auth/PERMISSIONS_BY_ROLE`). Implement `<RoleGate>` + `useCan()` hook. |
| M4.3 | Device registration: 6-digit access-code flow (hashed; `pos_mobile_sessions` table with rate-limit per IP). Device-bound till sessions. |
| M4.4 | Manager PIN-override: async `OverrideRequest` → manager phone receives it → approve/deny → till proceeds. (Async by design; never an in-person walk-over per architecture doc.) |
| M4.5 | Tenant-context middleware: every API route extracts tenant from session, calls `set_tenant_context(uuid)` GUC, all Prisma queries scoped. RLS double-checks. |

**DoD:** Two tenants can be onboarded; staff from tenant A cannot read tenant B data via any route. Penetration-test the tenant boundary as part of the PR review.

### M5 — Backoffice MVP
**Capability:** Manager can see sales, manage inventory, void/refund, see compliance alerts.

| PR | Scope |
|---|---|
| M5.1 | Sales report: daily totals, by budtender, by category, with kernel refusal-rate metrics (how often the kernel refused, which codes — diagnostic for ruleset accuracy). |
| M5.2 | Inventory view + adjustment UI. |
| M5.3 | Void / refund flow. Refunds gated by kernel (cannabis refund rules: MI adverse/defective only, IL 5-day SVS entry). |
| M5.4 | Compliance alert surface (consumes `packages/compliance-monitor` output — though monitor is M9). Stub UI until M9 lands. |
| M5.5 | Reconciliation queue UI (Afterroar pattern: ambiguous outcomes like declined deferred captures, lot oversells, METRC-divergent sales — operator reviews + decides + audit-logs). |

**DoD:** A manager can run a closing-shift review and identify any anomalies from the sales day in under 5 minutes.

### M6 — Hardware drivers
**Capability:** All five peripherals work on a real Android tablet.

| PR | Scope |
|---|---|
| M6.1 | Barcode scanner: WebHID + fallback to global `keydown` capture phase listener (Afterroar's pattern — no hidden input fields, dedups rapid-fire). |
| M6.2 | PDF417 ID reader: parses AAMVA spec into `{firstName, lastName, dob, expiry, address, idNumberHash}`. ID number is **hashed before storage** (PHI). |
| M6.3 | ESC/POS printer driver: USB + Bluetooth. Receipt template's monospace output goes straight to printer. |
| M6.4 | Cash drawer kick: ESC/POS-driven (drawer plugs into printer, printer fires kick command per Afterroar pattern). |
| M6.5 | NTEP scale driver: serial protocol (likely USB-to-serial bridge or BLE-serial). NTEP-certified-only constraint. |

**DoD:** Each peripheral works on Shawn's existing hardware. Smoke test: scan a product, verify ID, weigh against package weight, print receipt, kick drawer.

### M7 — METRC integration (real)
**Capability:** Sales sync to METRC sandbox; daily reconciliation shows zero drift.

| PR | Scope |
|---|---|
| M7.1 | Real `MetrcClient` implementation against MI sandbox. Per-operation handlers: receivePackage, recordSale, transferManifest, adjustPackage (Metrc legacy API sunset 4/1/2025 — Metrc Connect v2 only). |
| M7.2 | Outbox worker: claims → sends with idempotency key → markSent / markFailed with retry policy (exponential backoff, dead-letter at N tries). Vercel Cron triggers drain every minute. |
| M7.3 | Daily reconciliation job: compare local sales-by-day to METRC sales-by-day; flag variances to backoffice alert surface. |
| M7.4 | METRC adverse-event workflow (round-2 A10/B6: MI uses Patient menu even for adult-use). |

**DoD:** A day's worth of sandbox sales reconciles to zero drift. Adverse-event flow round-trips correctly.

**Blocked on:** sandbox creds (critical-path item).

### M8 — Offline-first sync
**Capability:** Till operates in state A (online), state B (backend down), state C (fully offline) per Afterroar's three-state model.

| PR | Scope |
|---|---|
| M8.1 | Local event store: IndexedDB if pure PWA, SQLite via Capacitor if peripheral access forces a shell. Event schema with Lamport clock + UUID + idempotency. |
| M8.2 | Sync protocol: `POST /api/sync { deviceId, lastSyncedLamport, events[] }` → response `{ per-event-status, server-events, server-lamport }`. Conflict policies per domain (sales = idempotent, inventory = additive math, prices = LWW). |
| M8.3 | State-C UX: persistent banner, per-sale confirm dialog, receipt says "card pending" (cashless ATM deferred capture), reconciliation queue picks up declined captures. Cannabis-specific: training mode also suppresses METRC sync. |
| M8.4 | Conflict resolution UI (extends M5.5 reconciliation queue). |

**DoD:** Pulling the network cord mid-sale results in a completed sale (cash) or a deferred sale (cashless ATM) with appropriate cashier signal. Reconnect → sync → server confirms.

### M9 — Compliance monitor MVP
**Capability:** Source registry runs scheduled checks against agency URLs, diffs against prior snapshot, opens human-review tasks; rules-release pipeline lets reviewer promote a draft ruleset to active.

| PR | Scope |
|---|---|
| M9.1 | Implement `SnapshotStore` + 3–5 critical source connectors: michigan.gov/cra, michigan.gov/treasury (MRE bulletin), Metrc-MI bulletin RSS, IDFPR/CROO, IDOR cannabis tax page. Cron-driven snapshot capture. |
| M9.2 | Diff algorithm: text-level diff on canonicalized content (strip nav/footer noise), categorized by `AlertCategory` (limits / tax / receipt / recall / etc.). |
| M9.3 | Human review queue UI in backoffice (or portal — restricted to compliance-officer role). Reviewer reads source diff, links to existing dossier section, can open a draft ruleset PR. |
| M9.4 | Rules-release pipeline: draft ruleset has new version + bumped `effectiveFrom` date; status starts at `secondary-cite-only`; once counsel signs, status becomes `counsel-verified`; deploy = ruleset row activation (no code deploy). |

**DoD:** A simulated CRA bulletin change is captured, flagged, reviewed, and results in a new ruleset draft within the same day. The whole feedback loop is observable in the backoffice.

### M10 — Pre-launch hardening
**Capability:** System is ready for counsel review and pilot.

| Item | Notes |
|---|---|
| Training-mode end-to-end test | Full day of fake sales, no real impact, all subsystems exercised. |
| IL §65-38 ("zapper" felony) hardening | Audit log immutability proofs; tamper-detection on sales records; demonstrate log integrity to counsel. |
| Penetration test of tenant boundary | Hire pentester or run internal red-team; can staff A see tenant B? Can a budtender see another's PIN-override request? |
| DR runbook | Backups, restore procedure, secrets rotation, METRC creds re-issuance flow. |
| Counsel engagement (Benesch shortlist) | Hand over: round-2 dossier reconciliation, MI A1 interpretive question, IL B3 conflict, MI tax stacking, ruleset JSON files. |
| Launch partner pilot | One MI store in training mode for 1-2 weeks; daily reconciliation; bug close-out. |

### M11 — Production cutover
**Capability:** Real sales flow.

| Item | Notes |
|---|---|
| Counsel signs MI ruleset | Updates fixture file `status` field from `secondary-cite-only` to `counsel-verified` for verified blocks (some may stay `secondary-cite-only` with explicit counsel acknowledgement). |
| Production env config flip | `KernelEnv.requireRulesetStatus = "counsel-verified"` in production. |
| Training mode disabled on launch tenant | `tenant.training = false`. |
| METRC production cert active | Sandbox → live API endpoint switch. |
| Banking active | Real cash flows; banking compliance per round-2 C1. |
| First real sale | Champagne. |

## 5. First execution slice

Starting on **M1.1 (MI + IL equivalency tables)** immediately after this doc is approved. Reasoning:
- Largest single unlock: the kernel currently refuses every line item on `EQUIVALENCY_UNDEFINED`. No cart work in M2 can be tested end-to-end until this lands.
- Lowest external dependency: no DB, no creds, no counsel needed for the data itself (just encoded as `secondary-cite-only` with the round-2 source chain).
- Surfaces the riskiest interpretive call (MI A1) early, so counsel question lands with maximum lead time.

**M1.1 PR shape:**
- Update `packages/compliance/src/rulesets/mi-2026-05-14.ts`: populate `equivalencies` table with the four MRTMA-applied ratios from round-2 A1; populate `limitsByCustomerKind.MI_MED_CAREGIVER` with per-patient rule (extending Ruleset shape if needed); bump `equivalenciesProvenance.status` to `secondary-cite-only` with Manus 2026-05-13 source chain; explicit inline comment flagging the MMMA→MRTMA interpretive leap as a counsel question.
- Update `packages/compliance/src/rulesets/il-2026-05-14.ts`: encode three independent cumulative-per-category caps as equivalencies (IL doesn't roll up to a single ounce, so the equivalency table maps category → conversion to its own cap dimension); populate `IL_MED_PATIENT` with 14-day medical limits from B3; inline comment flagging June/Sept 2025 CROO conflict, choosing newer 9-22-25 values.
- New `docs/sources/manus-2026-05-14/` directory: archive round-2 dossier files into the immutable-archive structure per `docs/sources/README.md`.
- Update `docs/compliance-dossier.md`: mark MI A1/A2/B2/B3 items as resolved-to-`secondary-cite-only`; add the three explicit counsel questions to the open-items list.
- New tests in `packages/compliance/src/__tests__/`: equivalency-rollup math, limit-window evaluation, MI vs IL cart property tests.

Subsequent slices follow the M1 → M2 → ... order, with M3-M9 milestones parallelizable where dependencies allow.

## 6. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| MI A1 equivalency is interpretively wrong | medium | high | `secondary-cite-only` until counsel confirms; explicit counsel question lands early in M1; production gated on `counsel-verified`. |
| IL vape THC conflict (June/Sept 2025 CROO) | known | medium | Encode newer value; inline counsel question; UI surfaces refusal as "counsel input needed" not engineering error. |
| METRC sandbox creds delayed | high | high | M1-M6 do not depend; M7 starts when creds arrive; outbox queues sales until then. |
| Local-tax rates unknown | high | medium | Local tax is per-tenant config, not in ruleset; tenant onboarding asks for it; refusal code if missing. |
| Counsel timeline > MVP code timeline | high | low (per current design) | Training mode covers the gap; pilot in training mode while counsel reviews. |
| Hardware peripheral incompatibility | low | medium | Shawn has the hardware; M6 smoke-tests early. |
| Offline deferred-capture cashless-ATM declines post-reconnect | medium | medium | UX guardrails per Afterroar lesson 11: cashier sees banner, confirms, receipt says "card pending"; reconciliation queue picks up declines. |
| Multi-tenant data leak | low | catastrophic | RLS double-checks Prisma scoping; pentest in M10; tenant-context middleware mandatory on every route. |
| Stale clone / DB-push catastrophe (per FUP HANDOFF_2026_04_22) | low | catastrophic | Single source of truth in `c:\dev\tend-o-matic`; no parallel clones for production tasks; document any temp clones with a tombstone in CLAUDE.md. |

## 7. References

- [docs/architecture.md](architecture.md) — design thesis
- [docs/compliance-dossier.md](compliance-dossier.md) — regulatory ledger (round-2 values flow into this in M1)
- [docs/indiana-entity-risk.md](indiana-entity-risk.md) — IN posture (round-2 part C feeds this)
- [docs/compliance-monitoring.md](compliance-monitoring.md) — monitor design (M9 implements)
- [docs/sources/manus-2026-05-13-round-2/](tendomatic_round2_compliance_dossier/) — Manus 2026-05-13 research (input to M1)
- FUP architectural reference (do not copy code): `C:\dev\Full Uproar Platform\ops-afterroar-store\`, `\afterroar-mobile\`, `\full-uproar-site\`. Patterns mirrored: immutable ledger, provider interfaces, event-sourced offline sync, training mode flag, reconciliation queue.
