// Vercel-cron-driven compliance source snapshot sweep. Hits every source
// in the registry, captures the canonicalized HTML, persists one row
// per source. Diff/alert classification happens at read-time in the
// /alerts page (cheap with the snapshot history); future work moves
// it into this cron so the queue is pre-classified.
//
// Cron schedule: see apps/backoffice/vercel.json. Vercel sends GET +
// the Authorization: Bearer <CRON_SECRET> header; we verify it so
// random visitors can't trigger DB writes.
//
// Manual smoke-test (preview): `vercel curl /api/cron/snapshot` from
// the linked app dir.

import { PrismaClient } from "@prisma/client";
import {
  SOURCE_REGISTRY,
  fetchSourceSnapshot,
} from "@tend-o-matic/compliance-monitor";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

function authorizedFor(req: Request): boolean {
  // Vercel cron sets this header automatically; in production we check
  // it. In development (no CRON_SECRET env), allow any caller so smoke
  // tests work locally.
  const expected = process.env.CRON_SECRET;
  if (!expected) return process.env.NODE_ENV !== "production";
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${expected}`;
}

export async function GET(req: Request) {
  if (!authorizedFor(req)) {
    return Response.json(
      { ok: false, reason: "unauthorized" },
      { status: 401 },
    );
  }

  const results: Array<{
    sourceCode: string;
    fetchStatus: number;
    contentHash: string;
    changedFromLast: boolean;
    error: string | null;
  }> = [];

  for (const source of SOURCE_REGISTRY) {
    const fetched = await fetchSourceSnapshot(source);
    const previous = await prisma.complianceSourceSnapshot.findFirst({
      where: { sourceCode: fetched.sourceCode },
      orderBy: { capturedAt: "desc" },
      select: { contentHash: true },
    });
    const changedFromLast =
      previous === null || previous.contentHash !== fetched.contentHash;
    await prisma.complianceSourceSnapshot.create({
      data: {
        sourceCode: fetched.sourceCode,
        capturedAt: new Date(fetched.capturedAt),
        contentHash: fetched.contentHash,
        contentText: fetched.contentText,
        contentBytes: fetched.contentBytes,
        fetchStatus: fetched.fetchStatus,
        fetchError: fetched.fetchError,
      },
    });
    results.push({
      sourceCode: fetched.sourceCode,
      fetchStatus: fetched.fetchStatus,
      contentHash: fetched.contentHash,
      changedFromLast,
      error: fetched.fetchError,
    });
  }

  return Response.json({
    ok: true,
    capturedAt: new Date().toISOString(),
    sourceCount: results.length,
    changedCount: results.filter((r) => r.changedFromLast).length,
    results,
  });
}
