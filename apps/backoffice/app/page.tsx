import Link from "next/link";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { loadBackofficeIdentity } from "../lib/identity";
import { BackofficeShell } from "../components/BackofficeShell";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatCents(c: bigint | number): string {
  const n = typeof c === "bigint" ? Number(c) : c;
  return `$${(n / 100).toFixed(2)}`;
}

export default async function Page() {
  const r = await loadBackofficeIdentity();
  if (!r.ok) {
    if (r.reason === "UNAUTHENTICATED") redirect("/sign-in");
    redirect("/forbidden");
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);

  const tenantId = r.identity.tenantId;

  const [today, week, voidsToday, productCount] = await Promise.all([
    prisma.sale.aggregate({
      where: {
        tenantId,
        status: "COMPLETE",
        openedAt: { gte: todayStart, lt: tomorrowStart },
      },
      _count: true,
      _sum: { totalCents: true },
    }),
    prisma.sale.aggregate({
      where: {
        tenantId,
        status: "COMPLETE",
        openedAt: { gte: weekStart, lt: tomorrowStart },
      },
      _count: true,
      _sum: { totalCents: true },
    }),
    prisma.sale.count({
      where: {
        tenantId,
        status: "VOIDED",
        voidedAt: { gte: todayStart, lt: tomorrowStart },
      },
    }),
    prisma.product.count({
      where: { tenantId, isActive: true },
    }),
  ]);

  return (
    <BackofficeShell identity={r.identity} activeSection="dashboard">
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Welcome, {r.identity.userName}.
      </p>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi
          label="Sales today"
          value={String(today._count)}
          sub={formatCents(today._sum.totalCents ?? 0n)}
          href="/sales"
        />
        <Kpi
          label="Sales 7 days"
          value={String(week._count)}
          sub={formatCents(week._sum.totalCents ?? 0n)}
          href="/sales"
        />
        <Kpi
          label="Voids today"
          value={String(voidsToday)}
          sub={voidsToday === 0 ? "—" : "needs review"}
          tone={voidsToday > 0 ? "warning" : "neutral"}
          href="/sales?status=VOIDED"
        />
        <Kpi
          label="Active products"
          value={String(productCount)}
          href="/products"
        />
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/sales"
          className="rounded-md border border-kraft-300 bg-cream p-4 transition-colors hover:border-kraft-700"
        >
          <div className="font-display text-base font-semibold">Sales</div>
          <p className="mt-1 text-xs text-ink-soft">
            Filter sales by date, cashier, status; drill into per-sale audit trail
            and void as needed.
          </p>
        </Link>
        <Link
          href="/products"
          className="rounded-md border border-kraft-300 bg-cream p-4 transition-colors hover:border-kraft-700"
        >
          <div className="font-display text-base font-semibold">Products</div>
          <p className="mt-1 text-xs text-ink-soft">
            Manage SKUs, lab values (Δ9-THC + THCA → adjusted-THC), COA references,
            and active/inactive state.
          </p>
        </Link>
        <Link
          href="/inventory"
          className="rounded-md border border-kraft-300 bg-cream p-4 transition-colors hover:border-kraft-700"
        >
          <div className="font-display text-base font-semibold">Inventory</div>
          <p className="mt-1 text-xs text-ink-soft">
            Per-package qty / status with audited manual adjustments. Sales now
            decrement automatically; voids restore.
          </p>
        </Link>
        <Link
          href="/alerts"
          className="rounded-md border border-kraft-300 bg-cream p-4 transition-colors hover:border-kraft-700"
        >
          <div className="font-display text-base font-semibold">
            Compliance alerts
          </div>
          <p className="mt-1 text-xs text-ink-soft">
            CRA / IDFPR / Metrc source watch. Vercel cron captures
            snapshots daily; diffs surface here for review.
          </p>
        </Link>
      </section>
    </BackofficeShell>
  );
}

function Kpi({
  label,
  value,
  sub,
  href,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  href?: string;
  tone?: "neutral" | "warning";
}) {
  const className = `rounded-md border bg-cream p-3 transition-colors ${
    tone === "warning"
      ? "border-clay-500"
      : "border-kraft-300 hover:border-kraft-700"
  }`;
  const inner = (
    <>
      <div className="text-xs uppercase tracking-wide text-ink-soft">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-ink-soft">{sub}</div>}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }
  return <div className={className}>{inner}</div>;
}
