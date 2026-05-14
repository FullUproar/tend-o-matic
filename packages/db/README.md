# @tend-o-matic/db

Prisma schema + RLS migrations + tenant-context helper.

## Bootstrap

Provision a Postgres database, set `DATABASE_URL` in `.env`, then:

```
pnpm --filter @tend-o-matic/db prisma migrate deploy
```

This applies the two committed migrations:

1. `20260514000000_init` — hand-written DDL matching `schema.prisma` (extensions, enums, tables, indexes).
2. `20260514000001_rls` — Row-Level Security policies + the `set_tenant_context(uuid)` / `current_tenant_id()` functions.

For subsequent schema changes, use `prisma migrate dev --name <change>` as normal; Prisma will generate a migration to match `schema.prisma`. Any new tenant-scoped table requires a follow-up RLS migration that enables + forces RLS and adds a `tenant_iso` policy — the kernel will refuse to add a table without RLS in CI eventually.

## Multi-tenancy

Every tenant-scoped table carries `tenant_id`. RLS isolates rows by a session-set GUC (`app.tenant_id`). The application sets the GUC by calling the SQL function `set_tenant_context(uuid)` inside each transaction.

The `withTenant(prisma, tenantId, fn)` helper in `src/tenant-context.ts` is the **only sanctioned way** to interact with the database from application code:

```ts
import { withTenant } from "@tend-o-matic/db";

await withTenant(prisma, tenantId, async (tx) => {
  return tx.user.findMany();
});
```

Using the outer `prisma` client inside `fn` bypasses the transaction and therefore the GUC — don't.

## Super-admin

The portal app does cross-tenant work (onboarding, fleet view). It connects with a separate DB role granted `BYPASSRLS` (or via security-definer functions). That role's connection string lives in `DATABASE_URL_ADMIN`; the role itself is created at infra-provision time and is not modeled in the Prisma schema.

## Audit log invariant

The RLS migration declares two restrictive policies on `audit_log` that deny UPDATE and DELETE for everyone except `BYPASSRLS` roles. Combined with the kernel's contract that the audit row is written in the same transaction as the mutation, this enforces append-only behavior at the database level. Best-effort logging is structurally impossible.
