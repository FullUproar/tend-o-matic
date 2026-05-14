-- Row-Level Security policies. Each tenant-scoped table is RLS-isolated
-- against a session-set GUC (app.tenant_id). The application MUST call
-- set_tenant_context(uuid) inside every transaction before any tenant-
-- scoped query. See packages/db/src/tenant-context.ts.
--
-- FORCE ROW LEVEL SECURITY is set so RLS applies even to the table
-- owner. Super-admin (cross-tenant portal work) must use a separate DB
-- role explicitly granted BYPASSRLS, or invoke security-definer
-- functions. That role's connection string is a deploy-time concern
-- and is not modeled in this schema.

CREATE OR REPLACE FUNCTION set_tenant_context(tid UUID) RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.tenant_id', tid::text, true);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
DECLARE
  v TEXT := current_setting('app.tenant_id', true);
BEGIN
  IF v IS NULL OR v = '' THEN
    RETURN NULL;
  END IF;
  RETURN v::uuid;
END;
$$ LANGUAGE plpgsql STABLE;

-- Enable + force RLS on every tenant-scoped table
ALTER TABLE tenant            ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant            FORCE  ROW LEVEL SECURITY;
ALTER TABLE "user"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user"            FORCE  ROW LEVEL SECURITY;
ALTER TABLE location          ENABLE ROW LEVEL SECURITY;
ALTER TABLE location          FORCE  ROW LEVEL SECURITY;
ALTER TABLE device            ENABLE ROW LEVEL SECURITY;
ALTER TABLE device            FORCE  ROW LEVEL SECURITY;
ALTER TABLE product           ENABLE ROW LEVEL SECURITY;
ALTER TABLE product           FORCE  ROW LEVEL SECURITY;
ALTER TABLE package           ENABLE ROW LEVEL SECURITY;
ALTER TABLE package           FORCE  ROW LEVEL SECURITY;
ALTER TABLE manifest          ENABLE ROW LEVEL SECURITY;
ALTER TABLE manifest          FORCE  ROW LEVEL SECURITY;
ALTER TABLE manifest_item     ENABLE ROW LEVEL SECURITY;
ALTER TABLE manifest_item     FORCE  ROW LEVEL SECURITY;
ALTER TABLE customer          ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer          FORCE  ROW LEVEL SECURITY;
ALTER TABLE sale              ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale              FORCE  ROW LEVEL SECURITY;
ALTER TABLE sale_item         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_item         FORCE  ROW LEVEL SECURITY;
ALTER TABLE payment           ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment           FORCE  ROW LEVEL SECURITY;
ALTER TABLE audit_log         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log         FORCE  ROW LEVEL SECURITY;
ALTER TABLE metrc_outbox      ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrc_outbox      FORCE  ROW LEVEL SECURITY;
ALTER TABLE manager_override  ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_override  FORCE  ROW LEVEL SECURITY;

-- Policies. Tenant table is self-referential; every other table
-- references tenant_id.
CREATE POLICY tenant_self ON tenant            USING (id        = current_tenant_id()) WITH CHECK (id        = current_tenant_id());
CREATE POLICY tenant_iso  ON "user"            USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY tenant_iso  ON location          USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY tenant_iso  ON device            USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY tenant_iso  ON product           USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY tenant_iso  ON package           USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY tenant_iso  ON manifest          USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY tenant_iso  ON manifest_item     USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY tenant_iso  ON customer          USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY tenant_iso  ON sale              USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY tenant_iso  ON sale_item         USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY tenant_iso  ON payment           USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY tenant_iso  ON audit_log         USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY tenant_iso  ON metrc_outbox      USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY tenant_iso  ON manager_override  USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());

-- Audit log is append-only at the policy level too: deny UPDATE / DELETE.
CREATE POLICY audit_no_update ON audit_log AS RESTRICTIVE FOR UPDATE USING (false);
CREATE POLICY audit_no_delete ON audit_log AS RESTRICTIVE FOR DELETE USING (false);
