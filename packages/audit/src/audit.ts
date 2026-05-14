// AuditRow describes the structure of the audit_log row written as a
// primary write in the same transaction as every mutation. Best-effort
// logging is not a thing in this system.
export type AuditEntityType =
  | "tenant"
  | "user"
  | "location"
  | "device"
  | "product"
  | "package"
  | "manifest"
  | "manifest_item"
  | "customer"
  | "sale"
  | "sale_item"
  | "payment"
  | "metrc_outbox"
  | "manager_override"
  | "compliance.ruleset_load"
  | "phi.access";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "void"
  | "refund"
  | "verify"
  | "override.request"
  | "override.grant"
  | "override.deny"
  | "login"
  | "logout"
  | "failure"
  | "export"
  | "view";

export type AuditRow = {
  id: string;
  tenantId: string;
  actorUserId: string | null;
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  // Free-form structured payload. Should be minimal and PHI-clean.
  // PHI access events use `phi.access` with the subject hash, never
  // the raw identifier.
  payload: Record<string, unknown>;
  at: string;
};
