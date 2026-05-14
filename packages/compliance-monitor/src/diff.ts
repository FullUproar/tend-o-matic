// Diff result between two Snapshots. The diff engine produces a
// jurisdiction-aware textual diff plus a confidence score for the
// classifier.
export type DiffSegment = {
  kind: "added" | "removed" | "changed";
  // Section path inside the captured document (heading chain).
  section: string;
  before?: string;
  after?: string;
};

export type Diff = {
  sourceCode: string;
  fromSnapshotId: string;
  toSnapshotId: string;
  generatedAt: string;
  segments: ReadonlyArray<DiffSegment>;
};
