# @tend-o-matic/audit

Append-only audit log. The audit row is a primary write, written inside the same transaction as every mutation. Best-effort logging is not a thing in this system; if the audit insert fails, the mutation aborts.

Database-level invariant: restrictive RLS policies on the `audit_log` table deny UPDATE and DELETE for all roles except `BYPASSRLS`. See `packages/db/prisma/migrations/20260514000001_rls/migration.sql`. Combined with the same-transaction contract here, append-only is enforced both at the application AND at the database.
