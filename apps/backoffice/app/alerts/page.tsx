import Link from "next/link";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import {
  SOURCE_REGISTRY,
  summarizeTextDiff,
} from "@tend-o-matic/compliance-monitor";
import { loadBackofficeIdentity } from "../../lib/identity";
import { BackofficeShell } from "../../components/BackofficeShell";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

function severityClass(severity: string): string {
  switch (severity) {
    case "urgent":
      return "bg-clay-500 text-cream";
    case "high":
      return "bg-mustard-500 text-ink";
    case "medium-high":
      return "bg-mustard-400 text-ink";
    case "medium":
      return "bg-kraft-300 text-ink-soft";
    default:
      return "bg-kraft-100 text-ink-soft";
  }
}

export default async function AlertsPage() {
  const r = await loadBackofficeIdentity();
  if (!r.ok) {
    if (r.reason === "UNAUTHENTICATED") redirect("/sign-in");
    redirect("/forbidden");
  }

  // For each registered source, pull the two most-recent snapshots so we
  // can render last-captured + delta-from-prior.
  const rows = await Promise.all(
    SOURCE_REGISTRY.map(async (source) => {
      const recent = await prisma.complianceSourceSnapshot.findMany({
        where: { sourceCode: source.code },
        orderBy: { capturedAt: "desc" },
        take: 2,
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
      const latest = recent[0] ?? null;
      const previous = recent[1] ?? null;
      const summary =
        latest && previous
          ? summarizeTextDiff(previous.contentText, latest.contentText)
          : null;
      return { source, latest, previous, summary };
    }),
  );

  const watched = rows.filter((r) => r.latest);
  const everCaptured = rows.filter((r) => r.latest !== null).length;
  const changedRecently = rows.filter((r) => r.summary?.changed).length;
  const fetchErrors = rows.filter(
    (r) => r.latest && (r.latest.fetchStatus !== 200 || r.latest.fetchError),
  ).length;

  return (
    <BackofficeShell identity={r.identity} activeSection="alerts">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-2xl font-semibold">
          Compliance alerts
        </h1>
        <span className="text-xs text-ink-soft">
          {SOURCE_REGISTRY.length} sources watched
        </span>
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        Snapshots are captured by a Vercel cron. Each diff is a candidate
        rule-change signal; the review queue (planned) lets a compliance
        officer accept / reject + open a draft ruleset PR.
      </p>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Watched" value={String(SOURCE_REGISTRY.length)} />
        <Kpi label="Ever captured" value={String(everCaptured)} />
        <Kpi
          label="Changed last sweep"
          value={String(changedRecently)}
          tone={changedRecently > 0 ? "warning" : "neutral"}
        />
        <Kpi
          label="Fetch errors"
          value={String(fetchErrors)}
          tone={fetchErrors > 0 ? "danger" : "neutral"}
        />
      </section>

      <table className="mt-6 w-full text-left text-sm">
        <thead className="border-b-2 border-kraft-700 text-xs uppercase text-ink-soft">
          <tr>
            <th className="py-2 pr-3">Source</th>
            <th className="py-2 pr-3">Sev</th>
            <th className="py-2 pr-3">Last captured</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2 pr-3 text-right">Δ words</th>
            <th className="py-2 pr-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-kraft-300">
          {watched.map(({ source, latest, summary }) => (
            <tr key={source.code}>
              <td className="py-2 pr-3">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-leaf-700 hover:underline"
                >
                  {source.name}
                </a>
                <div className="font-mono text-xs text-ink-soft">
                  {source.code} · {source.jurisdiction}
                </div>
              </td>
              <td className="py-2 pr-3">
                <span
                  className={`rounded-sm px-2 py-1 text-xs ${severityClass(source.severity)}`}
                >
                  {source.severity}
                </span>
              </td>
              <td className="py-2 pr-3 text-xs">
                {latest!.capturedAt.toLocaleString()}
              </td>
              <td className="py-2 pr-3 font-mono text-xs">
                {latest!.fetchError ? (
                  <span className="text-clay-700">err {latest!.fetchStatus}</span>
                ) : (
                  <span className="text-leaf-700">{latest!.fetchStatus}</span>
                )}
              </td>
              <td className="py-2 pr-3 text-right font-mono text-xs">
                {summary
                  ? summary.changed
                    ? `+${summary.addedWords} / -${summary.removedWords}`
                    : "—"
                  : "first"}
              </td>
              <td className="py-2 pr-3 text-right">
                <Link
                  href={`/alerts/${source.code}`}
                  className="text-xs text-leaf-700 hover:underline"
                >
                  history
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {watched.length === 0 && (
        <p className="mt-6 rounded-sm border border-dashed border-kraft-300 bg-paper p-8 text-center text-sm text-ink-soft">
          No snapshots captured yet. Trigger the cron manually:{" "}
          <code className="font-mono">GET /api/cron/snapshot</code>{" "}
          (CRON_SECRET required in production).
        </p>
      )}
    </BackofficeShell>
  );
}

function Kpi({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "warning" | "danger";
}) {
  const cls =
    tone === "danger"
      ? "border-clay-500"
      : tone === "warning"
        ? "border-mustard-500"
        : "border-kraft-300";
  return (
    <div className={`rounded-md border bg-cream p-3 ${cls}`}>
      <div className="text-xs uppercase tracking-wide text-ink-soft">{label}</div>
      <div className="mt-1 font-display text-xl font-semibold">{value}</div>
    </div>
  );
}
