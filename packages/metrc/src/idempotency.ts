// Idempotency keys are deterministic from the local domain event so that
// re-queueing the same logical operation never duplicates the call to
// METRC. The format is `<op>:<entityType>:<entityId>:<version>` and is
// computed at the moment the outbox row is written.
export function idempotencyKey(parts: {
  operation: string;
  entityType: string;
  entityId: string;
  version: string;
}): string {
  return `${parts.operation}:${parts.entityType}:${parts.entityId}:${parts.version}`;
}
