// Tiny token-level diff for canonicalized source text. Replaces a real
// LCS-based algorithm only when stability is in doubt; for v0.1 a
// word-set difference + first/last-changed-character span is enough
// to surface "did anything meaningful change" in the review queue.

export type TextDiffSummary = {
  changed: boolean;
  addedWords: number;
  removedWords: number;
  // First N characters that differ between before / after (truncated).
  excerpt: { before: string; after: string };
};

const EXCERPT_LEN = 240;

export function summarizeTextDiff(
  before: string,
  after: string,
): TextDiffSummary {
  if (before === after) {
    return {
      changed: false,
      addedWords: 0,
      removedWords: 0,
      excerpt: { before: "", after: "" },
    };
  }
  // Find first divergence point.
  let i = 0;
  while (i < before.length && i < after.length && before[i] === after[i]) {
    i++;
  }
  // Word-set difference (rough operational signal — not a real diff,
  // good enough for the review-queue ranking).
  const tokenize = (s: string): Set<string> =>
    new Set(
      s
        .toLowerCase()
        .split(/[^\p{L}\p{N}-]+/u)
        .filter((t) => t.length > 1),
    );
  const beforeSet = tokenize(before);
  const afterSet = tokenize(after);
  let added = 0;
  let removed = 0;
  for (const w of afterSet) if (!beforeSet.has(w)) added++;
  for (const w of beforeSet) if (!afterSet.has(w)) removed++;

  return {
    changed: true,
    addedWords: added,
    removedWords: removed,
    excerpt: {
      before: before.slice(i, i + EXCERPT_LEN),
      after: after.slice(i, i + EXCERPT_LEN),
    },
  };
}
