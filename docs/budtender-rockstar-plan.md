# Budtender "rockstar" plan — synthesis of 2026-05-14 Manus research

**Status:** draft, post-PR-#11/12 merge. Living document — revise as findings
get validated by real Michigan/Illinois budtender interviews.

## What this doc is

The [Manus budtender research brief](sources/manus-budtender-2026-05-14/research-brief.md)
identified ten concrete things customers and operators wish budtenders did
better, and ranked them by evidence strength. This doc:

1. Maps each finding to a Tend-O-Matic surface (kernel, till, backoffice,
   data, copy) so the build cost is visible up front.
2. Reconciles findings against the existing [MVP roadmap](mvp-roadmap.md) —
   some are already on the plan, some are net-new, some belong in the
   "would be nice" tier.
3. Proposes a near-term shipping sequence (the next 3–5 PRs).
4. Reserves a new milestone slot (**M12 — Budtender excellence layer**) for
   the larger pieces that should ship after MVP cutover, not before.

The research is **mostly strong evidence**, but Michigan/Illinois-specific
validation is thin. Treat the proposed near-term builds as bets — they're
informed bets, but they're not yet ground-truthed by real interviews.

## Reconciliation table — findings vs. roadmap

| Finding (Manus) | Already in roadmap | Net-new | Notes |
|---|---|---|---|
| **#1** Product-literacy panel (terpenes, cannabinoids, lineage, onset/duration) | partial — M3.1 stores `thcD9Pct`, `thcaPct`, `thcMg`, `strain`, `brand` | yes — terpenes, lineage, onset/duration, plain-English explanation | Was already on our rock-star list as "feature #2 (strain/effect panel + LLM search)". Manus sharpens it: lead with **effect** + **format** + **onset/duration**, not THC%. |
| **#2** Customer memory + preference tags | no | yes | `Customer` model exists in DB but only stores compliance-relevant fields. No purchase-history surface, no like/dislike tags, no preferred-format tags. **High leverage, medium build.** |
| **#3** Express vs. Guided service mode | no | yes | Single cart-level field + UI toggle. **Highest leverage per build cost** in the entire list. |
| **#4** Honesty / staff notes / "known issue" / "avoid" | no | yes | Adds free-text + structured notes on `Product`. Small build, big credibility win. |
| **#5** Training / practice mode | partial — M2.5 has tenant `training: true` flag (suppresses Metrc + payment + decrement) | needs UX layer — sandbox flow, SOP sign-offs, guided checkout simulation | The plumbing is there; what's missing is making it feel like a guided learning surface, not just "real till with stuff turned off." |
| **#6** Explainable compliance blocks (customer-safe language + manager override) | partial — refusal banner shows reason code; M4.4 has manager-phone override | needs **customer-safe phrasing** + script generator | Our `RefusalBanner` already shows the structured reason. Manus calls for a customer-facing script ("Why we can't do this") that the budtender can read aloud or hand the customer. |
| **#7** Inventory truth + substitutes | partial — M3 manages inventory; M7 reconciles to Metrc | needs **substitute finder** UI | This overlaps with our "rock-star feature #3: refusal recovery". Manus broadens it: substitute on **out-of-stock**, not just on **limit-blocked**. Same engine. |
| **#8** Bag-check / final cart readback / cash-change prompts | no | yes | Pre-TENDER confirmation modal + cash-change calculator. Touch-targets and clarity beat magic. **Small build, real customer impact.** |
| **#9** Responsible-guidance guardrails (no medical claims) | no | yes — but mostly **copy + UI guards**, not engine work | When product info panel ships, this is the right time to bake in "no diagnosis", "consult clinician", "start low / go slow" copy. |
| **#10** Make the system the memory (searchable KB, community/staff notes, review snippets) | no | yes | Convergence of #1, #2, #4. The system-as-memory is the throughline, not a separate feature. |

## Where these land

### Build now (this milestone window — small, high-leverage)

These are each **one or two PRs** of work, ship-incrementally-safe, and
reinforce the landing-page positioning we already shipped.

1. **Service mode toggle** (Finding #3). Cart-level field
   `serviceMode: 'EXPRESS' | 'GUIDED' | 'FIRST_TIME' | 'MEDICAL_SENSITIVE'`.
   Express hides the product-info expander and minimizes chrome between
   customer-set and tender. Guided expands it. First-time adds an
   ID-verify reminder and a "start low / go slow" panel. Medical-sensitive
   shows the responsible-guidance copy block. **Cost:** ~150 lines, no
   DB migration (cart is ephemeral).

2. **Final cart readback before TENDER** (Finding #8). A modal pre-tender
   that shows: line items, qty, total, change-due (for cash), and a
   "everything in the bag?" checkbox. Single confirmation gate. **Cost:**
   ~80 lines, no DB.

3. **Customer-safe refusal scripts** (Finding #6). When the kernel
   refuses, the `RefusalBanner` already has a structured reason code. Add
   a `customerScript` field per code: "Sorry — Michigan limits adult-use
   purchases to 2.5 oz per visit. You're at X right now. Want me to swap
   the Y for a smaller package?" Budtender can read it aloud verbatim or
   hand the customer the tablet. **Cost:** ~100 lines + a copy pass. No
   schema change.

4. **Product staff notes** (Finding #4). Add `staffNotes`, `knownIssues`,
   `staffFavorite` to `Product`. Backoffice CRUD for notes; till shows
   them in product picker tooltip. **Cost:** one DB migration + one
   backoffice form section + one tooltip in till.

These four can ship as **one or two PRs**. Combined positioning win:
"Three weeks ago we shipped live headroom. Today we ship the four
small things every customer-facing budtender post on Reddit asked for."

### Build after MVP cutover — new milestone M12

These are bigger pieces that benefit from real-tenant data and counsel
sign-off on the surrounding scope. Slotted as **M12** post-M11
(production cutover):

- **M12.1 Customer memory panel** — purchase history, like/dislike tags,
  preferred-format tags, preferred-budget tags. Requires `Customer`
  schema additions, a privacy-policy pass (PHI rules), and a
  pull-to-load history UI in till.
- **M12.2 Product intelligence panel** — terpenes, cannabinoids beyond
  THC, lineage, onset/duration, plain-English effect summary. Needs
  product-data ingestion strategy (lab data, manual entry, brand
  metadata). LLM-backed natural-language search lands here as an
  *optional* layer behind a feature flag, **not** the headline.
- **M12.3 Substitute finder / refusal recovery** — same engine works
  for "out-of-stock substitute" and "limit-blocked alternative".
  Inputs: category, price band, effect profile, potency band,
  inventory availability. Output: ranked alternatives.
- **M12.4 Practice-mode UX layer** — beyond the existing training flag,
  build guided drills (ID-check, purchase-limit, return), SOP sign-offs,
  manager-visible training completion.
- **M12.5 Responsible-guidance guardrails** — first-class copy module
  + UI guards. No diagnosis prompts, "consult clinician" suggestion on
  medical-sensitive service mode, cannabinoid serving-size primer.

**Why M12 isn't M1.5:** these features make the till more *appealing*
but the [MVP definition](mvp-roadmap.md#1-mvp-definition) is "one
Michigan store running real sales". MVP doesn't need product
intelligence to clear that bar — it needs compliance, hardware,
Metrc, and offline-first. M12 makes Tend-O-Matic the budtender's
preferred POS rather than just the operator's compliant one. Important,
but post-launch.

### Don't build (yet)

- **Customer satisfaction score per budtender** — perverse-incentive
  risk per Manus. Wait for real-store data.
- **Gamified learning** — no evidence base; tone-mismatch with the
  "confidently punchy expert" brand.
- **Crowdsourced product-effect feedback** — drifts toward medical
  claims territory.

These stay on the **discovery list**, not the build list.

## Positioning impact on the landing page

The landing page already lists "natural-language product search" and
"refusal recovery" as "shipping next." After this synthesis, the
"shipping next" tags should evolve:

- **Service mode** moves to "shipping now" once it ships (next PR).
- **Customer memory** is the strongest "shipping next" hook (matches
  the "your store remembers, even when the same budtender is not on
  shift" line from Manus's positioning table).
- The "for your budtender" section can grow a fourth card:
  "**The till speaks the customer's language**" — for the
  customer-safe refusal scripts.

## Validation we still need

Manus flags this explicitly: most evidence is broadly applicable
cannabis-retail signal, not Michigan/Illinois-specific. Before
committing to M12 in earnest, we should:

- Run the [interview script in the brief](sources/manus-budtender-2026-05-14/research-brief.md#interview-questions-to-validate-in-michigan-and-illinois)
  with 10–15 budtenders and managers in Michigan.
- Validate that **service mode** as a concept resonates — is
  "Express vs. Guided" a real felt distinction, or is it our framing?
- Validate the **substitute finder** as a felt need — operators may
  already do this informally; the question is whether the system
  framing earns its keep.
- Validate that customers actually want **customer-safe refusal
  scripts** spoken aloud, or whether they'd prefer the budtender
  paraphrase rather than read.

## Sequence recommendation

Once the user signs off on this direction:

1. **PR #13** — Service mode toggle + final cart readback (Findings #3, #8).
   One PR; cart-level only; no DB. ~200 lines + tests + screenshots.
2. **PR #14** — Customer-safe refusal scripts (Finding #6). Builds on
   `RefusalBanner`; adds a `customerScript` field to the refusal type;
   copy pass on every reason code. ~150 lines.
3. **PR #15** — Product staff notes (Finding #4). DB migration +
   backoffice form + till tooltip. ~250 lines.
4. **Then** revisit MVP milestones (M3/M5) for normal sequencing.
5. **Post-M11:** open M12 PRs (customer memory, product intelligence,
   substitute finder, practice-mode UX, responsible-guidance copy).
