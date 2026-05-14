# @tend-o-matic/compliance

The kernel. Pure TypeScript, no I/O. Dated immutable rulesets indexed by jurisdiction × effective date, evaluated by a function set the cart cannot bypass.

## Surface

```
applyLineItem(cart, item)   -> { ok: true; cart } | { ok: false; reason: RefusalReason }
checkLimits(cart)           -> { ok: true; statuses } | { ok: false; reason: RefusalReason }
computeTaxes(cart)          -> { ok: true; taxes }   | { ok: false; reason: RefusalReason }
renderReceipt(cart)         -> { ok: true; receipt } | { ok: false; reason: RefusalReason }
validatePromo(cart, promo)  -> { ok: true }          | { ok: false; reason: string }
```

## Verification gating

`makeKernel({ requireRulesetStatus })` parameterizes the kernel by environment. Production requires `counsel-verified`. Dev/test can run on `secondary-cite-only`. The kernel refuses *every* method on a ruleset below the required threshold.

Values in `src/rulesets/mi-2026-05-14.ts` and `src/rulesets/il-2026-05-14.ts` are seeded from Manus 2026-05-13 research and tagged `secondary-cite-only`. They will not load in production until a Michigan or Illinois cannabis attorney signs off on each rule block in `docs/compliance-dossier.md` and the corresponding `provenance.status` is bumped to `counsel-verified`.

## What v0.1 implements

- Universal guards: ruleset verification threshold, jurisdiction match, product eligibility (tested + labeled + not recalled), ID-verified for adult-use, equivalency-defined for the line item's category.
- Type surface for limit math, tax math, receipt content, promo validation.

## What v0.1 does NOT implement

- Actual limit math (depends on counsel-verified equivalencies).
- Tax engine (entirely TODO in dossier).
- Receipt content (entirely TODO in dossier).
- Promo logic.

These ship in a later PR once dossier values are counsel-verified.
