-- M9 — Compliance source snapshot table.
--
-- Global (NOT tenant-scoped) because regulator sources are platform-
-- wide. Tenant-specific subscriptions land in a follow-up.

CREATE TABLE IF NOT EXISTS compliance_source_snapshot (
  id              UUID PRIMARY KEY,
  source_code     TEXT NOT NULL,
  captured_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  content_hash    TEXT NOT NULL,
  content_text    TEXT NOT NULL,
  content_bytes   INTEGER NOT NULL,
  fetch_status    INTEGER NOT NULL,
  fetch_error     TEXT
);

CREATE INDEX IF NOT EXISTS compliance_source_snapshot_source_code_captured_at_idx
  ON compliance_source_snapshot (source_code, captured_at DESC);
