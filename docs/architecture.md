# Architecture

## Thesis

Cannabis POS is comply-or-die: a single non-compliant sale can pull a store's
license. Incumbents treat compliance as a feature module bolted onto a generic
retail engine. We invert that: **compliance is the kernel the cart runs on top
of.** The cart cannot bypass it.

That decision drives every other one in this repo.

## Monorepo shape

pnpm workspaces. Apps render; they do not encode rules. All cannabis-aware
logic lives in `packages/compliance`, `packages/metrc`, `packages/payments`,
`packages/audit`.

```
apps/
  till         budtender POS (Android tablet PWA-first; Capacitor shell only
               if peripheral access forces it)
  backoffice   manager/admin web
  portal       super-admin / tenant onboarding / fleet view
packages/
  db           Prisma schema, multi-tenant
  compliance   the kernel — pure TS, no I/O
  metrc        typed METRC client with outbox + idempotency
  payments     provider abstraction (cash, cashless-ATM, ACH) — no card networks
  audit        append-only audit log, primary write in the same txn as mutations
  ui           touch-first design system
  auth         sessions, RBAC, device-bound till registration, manager-PIN overrides
  hardware     barcode scanner, PDF417 ID scanner, ESC/POS printer, drawer, NTEP scale, label printer
```

## Compliance kernel

`packages/compliance` is pure functions, no I/O:

```
applyLineItem(cart, item, ruleset)               -> cart | refusal{reasonCode}
checkLimits(cart, customerType, totals, ruleset) -> allowed | reason
computeTaxes(cart, customerType, locality, ruleset) -> tax breakdown
renderReceipt(sale, ruleset)                     -> receipt content
validatePromo(promo, ruleset)                    -> ok | reason
```

The cart reducer is wrapped by the ruleset. **No code path adds a line item
without consulting the kernel.**

Rulesets are **dated and immutable**. A sale from 2026-03-14 is forever
evaluated against the ruleset in force on 2026-03-14. CRA rule changes
publish a new ruleset version; old sales don't get retroactively wrong.

The kernel is property-tested and fuzz-tested. "Cart accepts a line item
that violates the active ruleset" is a regression that fails the build.

## Multi-tenancy

From day one. Every row carries `tenant_id`. Postgres Row-Level Security
enforces isolation against a session-set `app.tenant_id` GUC — belt and
suspenders against query bugs.

Tenant context is set at the edge from the authenticated session, **never
trusted from request body**. Super-admin lives outside tenant scope and
has its own audited access path.

Tenant model carries: license number(s), license type (adult-use / medical /
dual), locality + local tax config, encrypted METRC API key, time zone,
receipt branding, enabled payment providers, feature flags.

## METRC integration

Built against sandbox first; live cert requires the partner's CRA-issued
API key. **Outbox pattern**: every state change writes a row to
`metrc_outbox` in the same transaction as the local mutation. A worker
drains it with idempotency keys and retries. **Internet outages cannot
stop sales.**

A nightly reconciliation job compares local sales to METRC sales-by-day
and flags variances to a manager inbox.

## Audit

The audit row is a **primary write**, same transaction as every mutation.
Not best-effort logging. If the audit insert fails, the mutation fails.

Patient data is treated as PHI: encrypted at rest, access-logged, even if
strict HIPAA does not apply.

## Hardware

Android tablet first, PWA. Capacitor shell only added when peripheral
access (USB scanners, ESC/POS over Bluetooth, NTEP scale serial) forces it.
The decision is driven by what we can do from a browser at the time we
actually need each peripheral, not by ideology.

## What this is not

- Not a generic retail POS with a cannabis plugin.
- Not a system that can produce a non-compliant sale.
- Not built on card networks (federally scheduled — Stripe/Square/Visa/MC are
  not options).
