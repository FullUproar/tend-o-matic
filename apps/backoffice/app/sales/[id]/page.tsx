import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { loadBackofficeIdentity } from "../../../lib/identity";
import { BackofficeShell } from "../../../components/BackofficeShell";
import { voidSaleAction } from "../actions";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

function formatCents(c: bigint | number): string {
  const n = typeof c === "bigint" ? Number(c) : c;
  return `$${(n / 100).toFixed(2)}`;
}

function formatDateTime(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function SaleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const r = await loadBackofficeIdentity();
  if (!r.ok) {
    if (r.reason === "UNAUTHENTICATED") redirect("/sign-in");
    redirect("/forbidden");
  }

  const sale = await prisma.sale.findFirst({
    where: { id: params.id, tenantId: r.identity.tenantId },
    include: {
      cashier: { select: { id: true, name: true, email: true } },
      voider: { select: { id: true, name: true, email: true } },
      location: { select: { name: true, licenseNo: true } },
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          package: {
            select: {
              metrcTag: true,
              product: { select: { name: true, sku: true, strain: true } },
            },
          },
        },
      },
      payments: { orderBy: { capturedAt: "asc" } },
    },
  });
  if (!sale) notFound();

  const auditEntries = await prisma.auditLog.findMany({
    where: {
      tenantId: r.identity.tenantId,
      entityType: "sale",
      entityId: sale.id,
    },
    orderBy: { at: "asc" },
  });

  const canVoid = sale.status === "COMPLETE";
  const boundVoid = voidSaleAction.bind(null, sale.id);

  return (
    <BackofficeShell identity={r.identity} activeSection="sales">
      <div className="mb-4 text-xs text-ink-soft">
        <Link href="/sales" className="hover:underline">
          ← Sales
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">
            Receipt {sale.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="mt-1 text-xs text-ink-soft">
            {formatDateTime(sale.openedAt)} ·{" "}
            {sale.cashier?.name ?? sale.cashier?.email} · ruleset{" "}
            <span className="font-mono">{sale.rulesetVersion}</span>
          </p>
        </div>
        <StatusBadge status={sale.status} large />
      </div>

      {sale.status === "VOIDED" && (
        <div className="mt-4 rounded-md border-l-4 border-clay-500 bg-clay-300 bg-opacity-30 p-3 text-sm">
          <div className="font-semibold uppercase text-clay-700">Voided</div>
          <p className="mt-1">
            Voided by {sale.voider?.name ?? sale.voider?.email ?? "(unknown)"} at{" "}
            {formatDateTime(sale.voidedAt)}.
            {sale.voidReason && (
              <>
                <br />
                Reason: <span className="italic">{sale.voidReason}</span>
              </>
            )}
          </p>
        </div>
      )}

      <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
        <div className="rounded-md border border-kraft-300 bg-cream p-4">
          <h2 className="font-display text-base font-semibold">Lines</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs uppercase text-ink-soft">
              <tr className="border-b border-kraft-300">
                <th className="pb-2 pr-3">Product</th>
                <th className="pb-2 pr-3">Category</th>
                <th className="pb-2 pr-3">Qty</th>
                <th className="pb-2 pr-3">Weight</th>
                <th className="pb-2 pr-3 text-right">Unit</th>
                <th className="pb-2 pr-3 text-right">Line total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kraft-300">
              {sale.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 pr-3">
                    <div className="font-medium">
                      {item.package?.product.name ?? "—"}
                    </div>
                    <div className="font-mono text-xs text-ink-soft">
                      {item.package?.product.sku} · {item.package?.metrcTag}
                    </div>
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs">{item.category}</td>
                  <td className="py-2 pr-3 font-mono text-xs">
                    {String(item.qty)}
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs">
                    {String(item.weightValue)} {item.weightUnit}
                  </td>
                  <td className="py-2 pr-3 text-right font-mono text-xs">
                    {formatCents(item.unitPriceCents)}
                  </td>
                  <td className="py-2 pr-3 text-right font-mono">
                    {formatCents(item.lineTotalCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 ml-auto w-64 space-y-1 border-t-2 border-kraft-700 pt-3 text-sm">
            <Row label="Subtotal" value={formatCents(sale.subtotalCents)} />
            <Row label="Tax" value={formatCents(sale.taxCents)} muted />
            <Row label="TOTAL" value={formatCents(sale.totalCents)} bold />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-md border border-kraft-300 bg-cream p-4">
            <h2 className="font-display text-base font-semibold">Payments</h2>
            <ul className="mt-2 divide-y divide-kraft-300 text-sm">
              {sale.payments.map((p) => (
                <li key={p.id} className="flex items-baseline justify-between py-2">
                  <span className="font-mono text-xs">{p.tenderType}</span>
                  <span className="font-mono">{formatCents(p.amountCents)}</span>
                </li>
              ))}
              {sale.payments.length === 0 && (
                <li className="py-2 text-xs text-ink-soft">No payments recorded.</li>
              )}
            </ul>
          </div>

          <div className="rounded-md border border-kraft-300 bg-cream p-4">
            <h2 className="font-display text-base font-semibold">Audit trail</h2>
            <ul className="mt-2 space-y-2 text-xs">
              {auditEntries.map((a) => (
                <li key={a.id} className="border-l-2 border-kraft-300 pl-2">
                  <div className="font-mono">
                    {a.action} · {formatDateTime(a.at)}
                  </div>
                  <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-[10px] text-ink-soft">
                    {JSON.stringify(a.payload, null, 0)}
                  </pre>
                </li>
              ))}
              {auditEntries.length === 0 && (
                <li className="text-xs text-ink-soft">No audit entries yet.</li>
              )}
            </ul>
          </div>

          {canVoid && (
            <form
              action={boundVoid}
              className="rounded-md border-2 border-clay-500 bg-cream p-4"
            >
              <h2 className="font-display text-base font-semibold text-clay-700">
                Void this sale
              </h2>
              <p className="mt-1 text-xs text-ink-soft">
                Voiding marks the sale as VOIDED and writes an immutable audit row.
                Inventory restoration + tender refund land with M3.2.
              </p>
              <label className="mt-3 block text-sm">
                <span className="block text-xs text-ink-soft">Reason (required)</span>
                <input
                  type="text"
                  name="reason"
                  required
                  minLength={3}
                  maxLength={200}
                  placeholder="e.g. cashier error — wrong package scanned"
                  className="mt-1 w-full rounded-sm border border-kraft-300 bg-paper px-2 py-2 font-mono text-xs"
                />
              </label>
              <button
                type="submit"
                className="mt-3 w-full rounded-sm bg-clay-500 px-4 py-2 font-display text-sm font-semibold uppercase text-cream hover:bg-clay-700"
              >
                Void sale
              </button>
            </form>
          )}
        </div>
      </section>
    </BackofficeShell>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between ${
        bold ? "border-t border-kraft-700 pt-1 font-display text-base font-semibold" : ""
      } ${muted ? "text-ink-soft" : ""}`}
    >
      <span>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function StatusBadge({ status, large }: { status: string; large?: boolean }) {
  const base = large ? "px-3 py-2 text-sm" : "px-2 py-1 text-xs";
  if (status === "COMPLETE") {
    return (
      <span className={`rounded-sm bg-leaf-700 text-cream ${base}`}>complete</span>
    );
  }
  if (status === "VOIDED") {
    return (
      <span className={`rounded-sm bg-clay-500 text-cream ${base}`}>voided</span>
    );
  }
  return (
    <span className={`rounded-sm bg-kraft-300 text-ink-soft ${base}`}>
      {status.toLowerCase()}
    </span>
  );
}
