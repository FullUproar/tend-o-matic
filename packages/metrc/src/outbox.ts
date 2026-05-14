import type { MetrcOperation } from "./operation";

export type OutboxStatus = "QUEUED" | "IN_FLIGHT" | "SENT" | "FAILED";

// OutboxRecord is the in-memory shape of a metrc_outbox row. State
// transitions are written as audit rows.
export type OutboxRecord = {
  id: string;
  tenantId: string;
  operation: MetrcOperation;
  payload: unknown;
  idempotencyKey: string;
  attempts: number;
  lastError: string | null;
  status: OutboxStatus;
  queuedAt: string;
  sentAt: string | null;
};

// OutboxWorker is the abstract worker that drains the outbox. v0.1
// declares the interface; the actual fetcher lands when sandbox creds
// arrive.
export interface OutboxWorker {
  // claim() atomically marks a batch of QUEUED records IN_FLIGHT and
  // returns them. Implementations MUST be safe to run concurrently;
  // SELECT ... FOR UPDATE SKIP LOCKED is the recommended pattern.
  claim(batchSize: number): Promise<ReadonlyArray<OutboxRecord>>;
  send(record: OutboxRecord): Promise<
    | { ok: true; providerRef?: string }
    | { ok: false; retryable: boolean; error: string }
  >;
  markSent(record: OutboxRecord, providerRef?: string): Promise<void>;
  markFailed(record: OutboxRecord, error: string): Promise<void>;
}

export type RetryPolicy = {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitter: boolean;
};

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 10,
  baseDelayMs: 2_000,
  maxDelayMs: 5 * 60_000,
  jitter: true,
};
