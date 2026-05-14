import type { AuditRow, AuditEntityType, AuditAction } from "./audit";

// AuditWriter is the only sanctioned interface for writing audit rows.
// Implementations of this interface must write inside the same
// transaction as the mutation they record. A best-effort writer that
// catches errors and continues is not a valid implementation — the
// mutation must abort if the audit insert fails.
//
// The shape is intentionally narrow: there's no "maybe" writer, no
// retry, no async fire-and-forget. If you need that, your mutation is
// wrong, not this interface.
export interface AuditWriter {
  write(
    row: Omit<AuditRow, "id" | "at">,
  ): Promise<AuditRow>;
}

export type AuditEvent = {
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  actorUserId: string | null;
  tenantId: string;
  payload?: Record<string, unknown>;
};
