import Link from "next/link";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { loadBackofficeIdentity } from "../../lib/identity";
import { BackofficeShell } from "../../components/BackofficeShell";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

const PAGE_SIZE = 50;

type SearchParams = {
  from?: string;
  to?: string;
  status?: string;
  cashier?: string;
};

function startOfDayLocal(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDateParam(s: string | undefined, fallback: Date): Date {
  if (!s) return fallback;
  const d = new Date(s + "T00:00:00");
  return isNaN(d.getTime()) ? fallback : d;
}

function formatCents(c: bigint | number): string {
  const n = typeof c === "bigint" ? Number(c) : c;
  return `$${(n / 100).toFixed(2)}`;
}

function formatDateTime(d: Date): string {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const r = await loadBackofficeIdentity();
  if (!r.ok) {
    if (r.reason === "UNAUTHENTICATED") redirect("/sign-in");
    redirect("/forbidden");
  }

  const today = startOfDayLocal(new Date());
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const fromDate = parseDateParam(searchParams.from, sevenDaysAgo);
  const toDate = parseDateParam(searchParams.to, today);
  const toDateInclusive = new Date(toDate);
  toDateInclusive.setDate(toDateInclusive.getDate() + 1);
  const status = searchParams.status ?? "ALL";

  const where: Record<string, unknown> = {
    tenantId: r.identity.tenantId,
    openedAt: { gte: fromDate, lt: toDateInclusive },
  };
  if (status !== "ALL") where.status = status;
  if (searchParams.cashier) where.cashierUserId = searchParams.cashier;

  const [sales, cashiers, aggregates] = await Promise.all([
    prisma.sale.findMany({
      where,
      orderBy: { openedAt: "desc" },
      take: PAGE_SIZE,
      select: {
        id: true,
        openedAt: true,
        closedAt: true,
        voidedAt: true,
        status: true,
        customerKindAtSale: true,
        subtotalCents: true,
        taxCents: true,
        totalCents: true,
        cashier: { select: { id: true, name: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.user.findMany({
      where: { tenantId: r.identity.tenantId, role: "BUDTENDER" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.sale.aggregate({
      where,
      _count: true,
      _sum: { subtotalCents: true, taxCents: true, totalCents: true },
    }),
  ]);

  const dateStr = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <BackofficeShell identity={r.identity} activeSection="sales">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Sales</h1>
      </div>

      <form className="mt-4 flex flex-wrap items-end gap-3 rounded-md border border-kraft-300 bg-cream p-3">
        <label className="block">
          <span className="block text-xs text-ink-soft">From</span>
          <input
            type="date"
            name="from"
            defaultValue={dateStr(fromDate)}
            className="mt-1 rounded-sm border border-kraft-300 bg-paper px-2 py-1 text-sm font-mono"
          />
        </label>
        <label className="block">
          <span className="block text-xs text-ink-soft">To</span>
          <input
            type="date"
            name="to"
            defaultValue={dateStr(toDate)}
            className="mt-1 rounded-sm border border-kraft-300 bg-paper px-2 py-1 text-sm font-mono"
          />
        </label>
        <label className="block">
          <span className="block text-xs text-ink-soft">Status</span>
          <select
            name="status"
            defaultValue={status}
            className="mt-1 rounded-sm border border-kraft-300 bg-paper px-2 py-1 text-sm"
          >
            <option value="ALL">All</option>
            <option value="COMPLETE">Complete</option>
            <option value="VOIDED">Voided</option>
            <option value="OPEN">Open</option>
          </select>
        </label>
        <label className="block">
          <span className="block text-xs text-ink-soft">Cashier</span>
          <select
            name="cashier"
            defaultValue={searchParams.cashier ?? ""}
            className="mt-1 rounded-sm border border-kraft-300 bg-paper px-2 py-1 text-sm"
          >
            <option value="">All</option>
            {cashiers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name ?? c.email}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-sm bg-leaf-700 px-4 py-2 text-sm font-semibold uppercase text-cream hover:bg-leaf-600"
        >
          Apply
        </button>
        <Link
          href="/sales"
          className="text-xs text-ink-soft hover:underline"
        >
          Reset
        </Link>
      </form>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card label="Sales" value={String(aggregates._count)} />
        <Card
          label="Subtotal"
          value={formatCents(aggregates._sum.subtotalCents ?? 0n)}
        />
        <Card
          label="Tax"
          value={formatCents(aggregates._sum.taxCents ?? 0n)}
        />
        <Card
          label="Grand total"
          value={formatCents(aggregates._sum.totalCents ?? 0n)}
        />
      </div>

      {sales.length === 0 ? (
        <p className="mt-6 rounded-sm border border-dashed border-kraft-300 bg-paper p-8 text-center text-sm text-ink-soft">
          No sales in this range. Adjust filters above.
        </p>
      ) : (
        <table className="mt-6 w-full text-left text-sm">
          <thead className="border-b-2 border-kraft-700 text-xs uppercase text-ink-soft">
            <tr>
              <th className="py-2 pr-3">Receipt</th>
              <th className="py-2 pr-3">When</th>
              <th className="py-2 pr-3">Cashier</th>
              <th className="py-2 pr-3">Customer</th>
              <th className="py-2 pr-3 text-right">Items</th>
              <th className="py-2 pr-3 text-right">Subtotal</th>
              <th className="py-2 pr-3 text-right">Tax</th>
              <th className="py-2 pr-3 text-right">Total</th>
              <th className="py-2 pr-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kraft-300">
            {sales.map((s) => (
              <tr key={s.id}>
                <td className="py-2 pr-3 font-mono text-xs">
                  <Link
                    href={`/sales/${s.id}`}
                    className="text-leaf-700 hover:underline"
                  >
                    {s.id.slice(0, 8).toUpperCase()}
                  </Link>
                </td>
                <td className="py-2 pr-3 text-xs text-ink-soft">
                  {formatDateTime(s.openedAt)}
                </td>
                <td className="py-2 pr-3 text-xs">
                  {s.cashier?.name ?? s.cashier?.email ?? "—"}
                </td>
                <td className="py-2 pr-3 font-mono text-xs">
                  {s.customerKindAtSale ?? "—"}
                </td>
                <td className="py-2 pr-3 text-right font-mono text-xs">
                  {s._count.items}
                </td>
                <td className="py-2 pr-3 text-right font-mono">
                  {formatCents(s.subtotalCents)}
                </td>
                <td className="py-2 pr-3 text-right font-mono text-xs text-ink-soft">
                  {formatCents(s.taxCents)}
                </td>
                <td className="py-2 pr-3 text-right font-mono">
                  {formatCents(s.totalCents)}
                </td>
                <td className="py-2 pr-3">
                  <StatusBadge status={s.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </BackofficeShell>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-kraft-300 bg-cream p-3">
      <div className="text-xs uppercase tracking-wide text-ink-soft">{label}</div>
      <div className="mt-1 font-display text-xl font-semibold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "COMPLETE") {
    return (
      <span className="rounded-sm bg-leaf-700 px-2 py-1 text-xs text-cream">
        complete
      </span>
    );
  }
  if (status === "VOIDED") {
    return (
      <span className="rounded-sm bg-clay-500 px-2 py-1 text-xs text-cream">
        voided
      </span>
    );
  }
  return (
    <span className="rounded-sm bg-kraft-300 px-2 py-1 text-xs text-ink-soft">
      {status.toLowerCase()}
    </span>
  );
}
