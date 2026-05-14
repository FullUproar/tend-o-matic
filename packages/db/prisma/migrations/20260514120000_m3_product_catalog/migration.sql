-- M3.1 — Product catalog schema extension.
--
-- 1. New PackageStatus enum values (QUARANTINED, WASTE) — match the
--    round-2 dossier's recall/destruction workflow (MI A10 / IL B6).
-- 2. New Product columns: strain, thc_d9_pct, thca_pct, adjusted_thc_pct,
--    lab_coa_url, is_active, updated_at.
-- 3. New Package column: harvest_date (cultivation date; receipt rule).
-- 4. New index on (tenant_id, is_active) for backoffice product list
--    queries (de-listed products are common; we want the active filter
--    to use an index).
--
-- Backward compatibility: all new columns are nullable / have defaults.
-- Existing rows are untouched. Idempotent at the postgres-level via
-- IF NOT EXISTS guards.

-- Enum: add QUARANTINED + WASTE
ALTER TYPE package_status ADD VALUE IF NOT EXISTS 'QUARANTINED' AFTER 'HOLD';
ALTER TYPE package_status ADD VALUE IF NOT EXISTS 'WASTE' AFTER 'RECALLED';

-- Product: new attribute columns
ALTER TABLE product
  ADD COLUMN IF NOT EXISTS strain TEXT,
  ADD COLUMN IF NOT EXISTS thc_d9_pct NUMERIC(5, 3),
  ADD COLUMN IF NOT EXISTS thca_pct NUMERIC(5, 3),
  ADD COLUMN IF NOT EXISTS adjusted_thc_pct NUMERIC(5, 3),
  ADD COLUMN IF NOT EXISTS lab_coa_url TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Index for backoffice list (active products by tenant).
CREATE INDEX IF NOT EXISTS product_tenant_id_is_active_idx
  ON product (tenant_id, is_active);

-- Package: harvest date.
ALTER TABLE package
  ADD COLUMN IF NOT EXISTS harvest_date DATE;
