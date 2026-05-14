# tend-o-matic

Multi-tenant SaaS point-of-sale for cannabis dispensaries. Launching in Michigan
(adult-use + medical). Compliance is the kernel; the cart runs on top of it.

**Status:** Phase 0 — scaffold only. No business logic, no regulatory values,
no METRC calls. See [`docs/`](docs/) for the project brief in code form:

- [`docs/architecture.md`](docs/architecture.md) — monorepo shape, compliance-kernel thesis, multi-tenancy approach.
- [`docs/compliance-dossier.md`](docs/compliance-dossier.md) — the regulatory ledger. Every concrete value is TODO until verified against current CRA rules.
- [`docs/performance-budget.md`](docs/performance-budget.md) — front-of-house benchmarks as written regression targets.
- [`docs/ux-principles.md`](docs/ux-principles.md) — UX rules of engagement.

## Monorepo layout

```
apps/
  till/         budtender POS (Android tablet PWA first)
  backoffice/   manager/admin web
  portal/       super-admin / tenant onboarding / fleet view
packages/
  db/           Prisma schema + multi-tenant RLS
  compliance/   the kernel: rulesets, tax engine, limit engine, receipts
  metrc/        typed METRC client with outbox + idempotency
  payments/     cash, cashless-ATM, ACH (no card networks)
  audit/        append-only audit log
  ui/           touch-first design system
  auth/         sessions, RBAC, device-bound till registration
  hardware/     scanners, ID readers, printers, drawer, scale
```

## Dev quickstart

Requires Node 20+ and pnpm 9+.

```
pnpm install
pnpm typecheck
pnpm lint
pnpm test
```

Apps run individually:

```
pnpm --filter @tend-o-matic/till dev
pnpm --filter @tend-o-matic/backoffice dev
pnpm --filter @tend-o-matic/portal dev
```

## License

Proprietary. See [LICENSE](LICENSE). Entity name is TODO until the operating
entity is formed.
