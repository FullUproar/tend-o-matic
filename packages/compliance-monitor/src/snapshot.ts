// A Snapshot is one captured rendering of a Source at a point in time.
// Snapshots are immutable; the diff engine works on consecutive
// snapshot pairs.
export type Snapshot = {
  id: string;
  sourceCode: string;
  capturedAt: string;
  // Hash of the canonicalized content; used to short-circuit diffing
  // when nothing changed.
  contentHash: string;
  // Pointer into the snapshot storage (S3 key, blob URL, etc.).
  // Not actually fetched in v0.1.
  storageRef: string;
  // Byte size for telemetry / alerting on suspicious source bloat.
  bytes: number;
};

export interface SnapshotStore {
  put(snapshot: Snapshot, body: Uint8Array): Promise<void>;
  get(snapshotId: string): Promise<Uint8Array>;
  latestForSource(sourceCode: string): Promise<Snapshot | null>;
  list(sourceCode: string, limit: number): Promise<ReadonlyArray<Snapshot>>;
}
