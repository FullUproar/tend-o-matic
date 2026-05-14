-- Landing-page demo request inbox.
--
-- Global (NOT tenant-scoped) because submitters are prospects, not
-- tenants. Super-admin reads in the portal; public server action
-- writes from the marketing site. No RLS — keeps the public POST path
-- simple. Sensitive fields are limited to what the prospect typed.

CREATE TABLE IF NOT EXISTS demo_request (
  id            UUID PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  company       TEXT NOT NULL,
  role          TEXT,
  state         TEXT,
  message       TEXT,
  source_ip     TEXT,
  utm           JSONB,
  status        TEXT NOT NULL DEFAULT 'NEW',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  contacted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS demo_request_created_at_idx
  ON demo_request (created_at DESC);

CREATE INDEX IF NOT EXISTS demo_request_status_idx
  ON demo_request (status);
