-- Tend-O-Matic Phase 0 initial schema. Hand-written to match
-- prisma/schema.prisma so a clean DB can run `prisma migrate deploy`
-- without first running `prisma migrate dev`. Subsequent schema changes
-- should go through `prisma migrate dev` as usual.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE license_type AS ENUM ('ADULT_USE', 'MEDICAL', 'DUAL');
CREATE TYPE jurisdiction AS ENUM ('MI', 'IL');
CREATE TYPE user_role AS ENUM ('BUDTENDER', 'MANAGER', 'ADMIN');
CREATE TYPE device_kind AS ENUM ('TILL', 'MANAGER_PHONE', 'KIOSK', 'BACKOFFICE');
CREATE TYPE product_category AS ENUM ('FLOWER', 'CONCENTRATE', 'INFUSED', 'EDIBLE', 'PRE_ROLL', 'TOPICAL', 'IMMATURE_PLANT', 'OTHER');
CREATE TYPE package_status AS ENUM ('AVAILABLE', 'HOLD', 'RECALLED', 'DEPLETED', 'RETURNED');
CREATE TYPE manifest_status AS ENUM ('PENDING', 'RECEIVED', 'REJECTED', 'PARTIAL');
CREATE TYPE manifest_item_status AS ENUM ('ACCEPTED', 'REJECTED', 'DAMAGED', 'CHILD_CREATED');
CREATE TYPE customer_kind AS ENUM (
  'MI_ADULT_USE', 'MI_MED_PATIENT', 'MI_MED_CAREGIVER',
  'IL_ADULT_USE_RESIDENT', 'IL_ADULT_USE_NONRESIDENT', 'IL_MED_PATIENT'
);
CREATE TYPE sale_status AS ENUM ('OPEN', 'COMPLETE', 'VOIDED');
CREATE TYPE tender_type AS ENUM ('CASH', 'CASHLESS_ATM', 'ACH', 'OTHER');
CREATE TYPE metrc_outbox_status AS ENUM ('QUEUED', 'IN_FLIGHT', 'SENT', 'FAILED');
CREATE TYPE manager_override_status AS ENUM ('REQUESTED', 'GRANTED', 'DENIED', 'EXPIRED');

-- Tenant
CREATE TABLE tenant (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  license_no TEXT NOT NULL,
  license_type license_type NOT NULL,
  jurisdiction jurisdiction NOT NULL,
  locality TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Detroit',
  metrc_api_key_enc TEXT,
  enabled_payment_providers TEXT[] NOT NULL DEFAULT '{}',
  feature_flags JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- User
CREATE TABLE "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE RESTRICT,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  pin_hash TEXT,
  name TEXT,
  role user_role NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);
CREATE INDEX idx_user_tenant ON "user"(tenant_id);

-- Location
CREATE TABLE location (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id),
  name TEXT NOT NULL,
  license_no TEXT NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  timezone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_location_tenant ON location(tenant_id);

-- Device
CREATE TABLE device (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id),
  location_id UUID REFERENCES location(id),
  kind device_kind NOT NULL,
  name TEXT NOT NULL,
  public_key TEXT,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);
CREATE INDEX idx_device_tenant ON device(tenant_id);

-- Product
CREATE TABLE product (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id),
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  category product_category NOT NULL,
  brand TEXT,
  description TEXT,
  thc_mg NUMERIC(10,3),
  cbd_mg NUMERIC(10,3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, sku)
);
CREATE INDEX idx_product_tenant ON product(tenant_id);

-- Package
CREATE TABLE package (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id),
  location_id UUID NOT NULL REFERENCES location(id),
  product_id UUID NOT NULL REFERENCES product(id),
  metrc_tag TEXT NOT NULL,
  qty NUMERIC(14,4) NOT NULL,
  qty_unit TEXT NOT NULL,
  status package_status NOT NULL DEFAULT 'AVAILABLE',
  tested BOOLEAN NOT NULL DEFAULT FALSE,
  labeled BOOLEAN NOT NULL DEFAULT FALSE,
  recalled BOOLEAN NOT NULL DEFAULT FALSE,
  coa_url TEXT,
  parent_package_id UUID REFERENCES package(id),
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, metrc_tag)
);
CREATE INDEX idx_package_tenant ON package(tenant_id);
CREATE INDEX idx_package_status ON package(tenant_id, status);

-- Manifest
CREATE TABLE manifest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id),
  location_id UUID NOT NULL REFERENCES location(id),
  supplier_license_no TEXT NOT NULL,
  metrc_manifest_no TEXT,
  status manifest_status NOT NULL DEFAULT 'PENDING',
  received_at TIMESTAMPTZ,
  received_by_user_id UUID REFERENCES "user"(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_manifest_tenant ON manifest(tenant_id);

-- ManifestItem (tenant_id denormalized for RLS)
CREATE TABLE manifest_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id),
  manifest_id UUID NOT NULL REFERENCES manifest(id) ON DELETE CASCADE,
  source_tag TEXT NOT NULL,
  status manifest_item_status NOT NULL DEFAULT 'ACCEPTED',
  package_id UUID REFERENCES package(id),
  child_package_id UUID REFERENCES package(id),
  notes TEXT
);
CREATE INDEX idx_manifest_item_tenant ON manifest_item(tenant_id);
CREATE INDEX idx_manifest_item_manifest ON manifest_item(manifest_id);

-- Customer
CREATE TABLE customer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id),
  kind customer_kind NOT NULL,
  dob_enc TEXT,
  id_hash TEXT,
  registry_id_hash TEXT,
  caregiver_id_hash TEXT,
  served_patient_id_hash TEXT,
  last_id_scan_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_customer_tenant ON customer(tenant_id);

-- Sale
CREATE TABLE sale (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id),
  location_id UUID NOT NULL REFERENCES location(id),
  cashier_user_id UUID NOT NULL REFERENCES "user"(id),
  customer_id UUID REFERENCES customer(id),
  customer_kind_at_sale customer_kind,
  ruleset_version TEXT NOT NULL,
  status sale_status NOT NULL DEFAULT 'OPEN',
  subtotal_cents BIGINT NOT NULL DEFAULT 0,
  tax_cents BIGINT NOT NULL DEFAULT 0,
  total_cents BIGINT NOT NULL DEFAULT 0,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,
  voided_by_user_id UUID REFERENCES "user"(id),
  void_reason TEXT
);
CREATE INDEX idx_sale_tenant ON sale(tenant_id);
CREATE INDEX idx_sale_open ON sale(tenant_id, location_id, opened_at);

-- SaleItem (tenant_id denormalized)
CREATE TABLE sale_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id),
  sale_id UUID NOT NULL REFERENCES sale(id),
  package_id UUID NOT NULL REFERENCES package(id),
  category product_category NOT NULL,
  qty NUMERIC(14,4) NOT NULL,
  weight_value NUMERIC(14,4) NOT NULL,
  weight_unit TEXT NOT NULL,
  unit_price_cents BIGINT NOT NULL,
  line_total_cents BIGINT NOT NULL,
  equivalent_grams NUMERIC(14,4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sale_item_tenant ON sale_item(tenant_id);
CREATE INDEX idx_sale_item_sale ON sale_item(sale_id);

-- Payment (tenant_id denormalized)
CREATE TABLE payment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id),
  sale_id UUID NOT NULL REFERENCES sale(id),
  tender_type tender_type NOT NULL,
  amount_cents BIGINT NOT NULL,
  provider_ref TEXT,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payment_tenant ON payment(tenant_id);
CREATE INDEX idx_payment_sale ON payment(sale_id);

-- AuditLog
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id),
  actor_user_id UUID REFERENCES "user"(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_tenant_at ON audit_log(tenant_id, at DESC);
CREATE INDEX idx_audit_entity ON audit_log(tenant_id, entity_type, entity_id);

-- METRC outbox
CREATE TABLE metrc_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id),
  operation TEXT NOT NULL,
  payload JSONB NOT NULL,
  idempotency_key TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  status metrc_outbox_status NOT NULL DEFAULT 'QUEUED',
  queued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  UNIQUE (tenant_id, idempotency_key)
);
CREATE INDEX idx_metrc_outbox_status ON metrc_outbox(tenant_id, status);

-- ManagerOverride
CREATE TABLE manager_override (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id),
  sale_id UUID REFERENCES sale(id),
  requested_by_user_id UUID NOT NULL REFERENCES "user"(id),
  granted_by_manager_user_id UUID REFERENCES "user"(id),
  reason_code TEXT NOT NULL,
  status manager_override_status NOT NULL DEFAULT 'REQUESTED',
  phone_device_id UUID REFERENCES device(id),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_at TIMESTAMPTZ,
  denied_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);
CREATE INDEX idx_override_tenant ON manager_override(tenant_id);
CREATE INDEX idx_override_status ON manager_override(tenant_id, status);
