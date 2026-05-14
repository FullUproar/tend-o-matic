import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import {
  SOURCE_REGISTRY,
  summarizeTextDiff,
} from "@tend-o-matic/compliance-monitor";
import { loadBackofficeIdentity } from "../../../lib/identity";
import { BackofficeShell } from "../../../components/BackofficeShell";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function SourceHistoryPage({
  params,
}: {
  params: { code: string };
}) {
  const r = await loadBackofficeIdentity();
  if (!r.ok) {
    if (r.reason === "UNAUTHENTICATED") redirect("/sign-in");
    redirect("/forbidden");
  }

  const source = SOURCE_REGISTRY.find((s) => s.code === params.code);
  if (!source) notFound();

  const snapshots = await prisma.complianceSourceSnapshot.findMany({
    where: { sourceCode: source.code },
    orderBy: { capturedAt: "desc" },
    take: 50,
    select: {
      id: true,
      capturedAt: true,
      contentHash: true,
      contentText: true,
      contentBytes: true,
      fetchStatus: true,
      fetchError: true,
    },
  });

  return (
    <BackofficeShell identity={r.identity} activeSection="alerts">
      <div className="mb-4 text-xs text-ink-soft">
        <Link href="/alerts" className="hover:underline">
          ← Alerts
        </Link>
      </div>
      <h1 className="font-display text-2xl font-semibold">{source.name}</h1>
      <p className="mt-1 text-xs text-ink-soft">
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-leaf-700 hover:underline"
        >
          {source.url}
        </a>
        {" · "}
        {source.jurisdiction} · cadence {source.cadence} · severity{" "}
        {source.severity}
      </p>
      {source.notes && (
        <p className="mt-2 rounded-sm bg-cream p-2 text-xs italic text-ink-soft">
          {source.notes}
        </p>
      )}

      {snapshots.length === 0 ? (
        <p className="mt-6 rounded-sm border border-dashed border-kraft-300 bg-paper p-8 text-center text-sm text-ink-soft">
          No snapshots yet for this source.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {snapshots.map((snap, idx) => {
            const prev = snapshots[idx + 1] ?? null;
            const summary = prev
              ? summarizeTextDiff(prev.contentText, snap.contentText)
              : null;
            return (
              <li
                key={snap.id}
                className="rounded-md border border-kraft-300 bg-cream p-3"
              >
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="font-mono text-xs">
                      {snap.capturedAt.toLocaleString()}
                    </div>
                    <div className="mt-1 text-[10px] text-ink-soft">
                      {snap.contentHash.slice(0, 16)}… · {snap.contentBytes} bytes ·{" "}
                      HTTP {snap.fetchStatus}
                      {snap.fetchError && (
                        <span className="text-clay-700">
                          {" · "}
                          {snap.fetchError}
                        </span>
                      )}
                    </div>
                  </div>
                  {summary ? (
                    summary.changed ? (
                      <span className="rounded-sm bg-mustard-500 px-2 py-1 text-xs text-ink">
                        +{summary.addedWords} / -{summary.removedWords}
                      </span>
                    ) : (
                      <span className="rounded-sm bg-kraft-300 px-2 py-1 text-xs text-ink-soft">
                        unchanged
                      </span>
                    )
                  ) : (
                    <span className="rounded-sm bg-leaf-700 px-2 py-1 text-xs text-cream">
                      first
                    </span>
                  )}
                </div>
                {summary?.changed && (
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <DiffCell label="before" text={summary.excerpt.before} />
                    <DiffCell label="after" text={summary.excerpt.after} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </BackofficeShell>
  );
}

function DiffCell({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-sm border border-kraft-300 bg-paper p-2">
      <div className="text-[10px] uppercase tracking-wide text-ink-soft">
        {label}
      </div>
      <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[10px]">
        {text || "(empty)"}
      </pre>
    </div>
  );
}
