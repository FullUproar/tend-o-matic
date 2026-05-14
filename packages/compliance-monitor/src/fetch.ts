// Source fetcher — pulls a regulator-facing URL, canonicalizes the
// content into a comparable text form, and returns the fetch result
// the persistence layer needs. Errors are returned, not thrown, so the
// cron sweep can record a row per source even when some fail.

import { createHash } from "node:crypto";
import type { Source } from "./source";

export type FetchResult = {
  sourceCode: string;
  contentText: string;
  contentHash: string;
  contentBytes: number;
  fetchStatus: number;
  fetchError: string | null;
  capturedAt: string; // ISO
};

// User-agent: most public regulator sites are fine with default UAs,
// but a clear identifier helps when we eventually need an explicit
// allow-listing conversation with an agency's webmaster.
const UA =
  "tend-o-matic compliance-monitor/0.1 (operator: full-uproar; +https://tend-o-matic.com)";

const FETCH_TIMEOUT_MS = 20_000;

// Strip patterns shared by most agency pages so the diff doesn't fire
// on every navigation/footer rotation. The regex set is intentionally
// loose — false positives (over-stripping) are fine; false negatives
// (under-stripping) just cause noisy alerts that the review queue
// dismisses.
function canonicalize(html: string): string {
  return html
    // Drop scripts/styles whole-tag.
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    // Drop nav/footer/header sections.
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    // Strip HTML tags, keep text.
    .replace(/<[^>]+>/g, " ")
    // Collapse whitespace.
    .replace(/\s+/g, " ")
    .trim();
}

function sha256Hex(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

export async function fetchSourceSnapshot(
  source: Source,
): Promise<FetchResult> {
  const capturedAt = new Date().toISOString();
  let html = "";
  let fetchStatus = 0;
  let fetchError: string | null = null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(new Error("fetch timeout")),
      FETCH_TIMEOUT_MS,
    );
    try {
      const response = await fetch(source.url, {
        headers: {
          "user-agent": UA,
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: controller.signal,
      });
      fetchStatus = response.status;
      html = await response.text();
      if (!response.ok) {
        fetchError = `HTTP ${response.status} ${response.statusText}`;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (e: unknown) {
    fetchError = e instanceof Error ? e.message : String(e);
  }
  const contentText = canonicalize(html);
  return {
    sourceCode: source.code,
    contentText,
    contentHash: sha256Hex(contentText),
    contentBytes: html.length,
    fetchStatus,
    fetchError,
    capturedAt,
  };
}
