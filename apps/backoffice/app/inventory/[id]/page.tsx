import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { loadBackofficeIdentity } from "../../../lib/identity";
import { BackofficeShell } from "../../../components/BackofficeShell";
import {
  adjustPackageQtyAction,
  setPackageStatusAction,
} from "../actions";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

const STATUS_OPTIONS = [
  "AVAILABLE",
  "HOLD",
  "QUARANTINED",
  "RECALLED",
  "DEPLETED",
  "WASTE",
  "RETURNED",
];

export default async function PackageDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const r = await loadBackofficeIdentity();
  if (!r.ok) {
    if (r.reason === "UNAUTHENTICATED") redirect("/sign-in");
    redirect("/forbidden");
  }
  const tenantId = r.identity.tenantId;

  const pkg = await prisma.package.findFirst({
    where: { id: params.id, tenantId },
    include: {
      product: { select: { name: true, sku: true, category: true, strain: true } },
      location: { select: { name: true } },
    },
  });
  if (!pkg) notFound();

  const audit = await prisma.auditLog.findMany({
    where: { tenantId, entityType: "package", entityId: pkg.id },
    orderBy: { at: "desc" },
    take: 20,
  });

  const boundAdjust = adjustPackageQtyAction.bind(null, pkg.id);
  const boundStatus = setPackageStatusAction.bind(null, pkg.id);

  return (
    <BackofficeShell identity={r.identity} activeSection="inventory">
      <div className="mb-4 text-xs text-ink-soft">
        <Link href="/inventory" className="hover:underline">
          ← Inventory
        </Link>
      </div>
      <h1 className="font-display text-2xl font-semibold">
        {pkg.product.name}
      </h1>
      <p className="mt-1 font-mono text-xs text-ink-soft">
        {pkg.product.sku} · {pkg.metrcTag} · {pkg.location.name}
      </p>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-md border border-kraft-300 bg-cream p-4">
          <h2 className="font-display text-base font-semibold">Adjust qty</h2>
          <p className="mt-1 text-xs text-ink-soft">
            Manual adjustments write an immutable audit row.
          </p>
          <form action={boundAdjust} className="mt-3 space-y-3">
            <div className="flex items-end gap-2">
              <label className="block flex-1">
                <span className="block text-xs text-ink-soft">
                  Current qty: {Number(pkg.qty).toFixed(2)} {pkg.qtyUnit}
                </span>
                <input
                  type="number"
                  name="delta"
                  step="0.01"
                  required
                  placeholder="e.g. -10 (remove) or 100 (add)"
                  className="mt-1 w-full rounded-sm border border-kraft-300 bg-paper px-2 py-2 font-mono"
                />
              </label>
            </div>
            <label className="block">
              <span className="block text-xs text-ink-soft">
                Reason (required)
              </span>
              <input
                type="text"
                name="reason"
                required
                minLength={3}
                maxLength={200}
                placeholder="e.g. recount; damaged units; sample"
                className="mt-1 w-full rounded-sm border border-kraft-300 bg-paper px-2 py-2 font-mono text-xs"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-sm bg-leaf-700 px-4 py-2 font-display text-sm font-semibold uppercase text-cream hover:bg-leaf-600"
            >
              Apply adjustment
            </button>
          </form>
        </div>

        <div className="rounded-md border border-kraft-300 bg-cream p-4">
          <h2 className="font-display text-base font-semibold">Status</h2>
          <p className="mt-1 text-xs text-ink-soft">
            Current: <span className="font-mono">{pkg.status}</span>
          </p>
          <form action={boundStatus} className="mt-3 space-y-3">
            <label className="block">
              <span className="block text-xs text-ink-soft">New status</span>
              <select
                name="status"
                defaultValue={pkg.status}
                className="mt-1 w-full rounded-sm border border-kraft-300 bg-paper px-2 py-2"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs text-ink-soft">
                Reason (required)
              </span>
              <input
                type="text"
                name="reason"
                required
                minLength={3}
                maxLength={200}
                placeholder="e.g. CRA recall notice received"
                className="mt-1 w-full rounded-sm border border-kraft-300 bg-paper px-2 py-2 font-mono text-xs"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-sm bg-mustard-500 px-4 py-2 font-display text-sm font-semibold uppercase text-ink hover:bg-mustard-400"
            >
              Change status
            </button>
          </form>
        </div>
      </section>

      <section className="mt-6 rounded-md border border-kraft-300 bg-cream p-4">
        <h2 className="font-display text-base font-semibold">
          Audit trail (last 20)
        </h2>
        {audit.length === 0 ? (
          <p className="mt-2 text-xs text-ink-soft">
            No audit entries yet for this package.
          </p>
        ) : (
          <ul className="mt-2 space-y-2 text-xs">
            {audit.map((a) => (
              <li key={a.id} className="border-l-2 border-kraft-300 pl-2">
                <div className="font-mono">
                  {a.action} · {a.at.toLocaleString()}
                </div>
                <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-[10px] text-ink-soft">
                  {JSON.stringify(a.payload, null, 0)}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </section>
    </BackofficeShell>
  );
}
