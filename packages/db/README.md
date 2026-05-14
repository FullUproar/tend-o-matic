# @tend-o-matic/db

Prisma schema and multi-tenant data access. Every row carries `tenant_id`; Postgres RLS enforces isolation against a session-set `app.tenant_id` GUC.
