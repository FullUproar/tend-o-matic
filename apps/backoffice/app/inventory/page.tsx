import Link from "next/link";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { loadBackofficeIdentity } from "../../lib/identity";
import { BackofficeShell } from "../../components/BackofficeShell";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

type SearchParams = {
  status?: string;
  q?: string;
};

const STATUS_OPTIONS = [
  "ALL",
  "AVAILABLE",
  "HOLD",
  "QUARANTINED",
  "RECALLED",
  "DEPLETED",
  "WASTE",
  "RETURNED",
];

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const r = await loadBackofficeIdentity();
  if (!r.ok) {
    if (r.reason === "UNAUTHENTICATED") redirect("/sign-in");
    redirect("/forbidden");
  }
  const tenantId = r.identity.tenantId;
  const status = searchParams.status ?? "AVAILABLE";
  const q = searchParams.q?.trim() ?? "";

  const where: Record<string, unknown> = { tenantId };
  if (status !== "ALL") where.status = status;
  if (q) {
    where.OR = [
      { metrcTag: { contains: q, mode: "insensitive" } },
      { product: { name: { contains: q, mode: "insensitive" } } },
      { product: { sku: { contains: q, mode: "insensitive" } } },
    ];
  }

  const packages = await prisma.package.findMany({
    where,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      product: { select: { id: true, name: true, sku: true, category: true } },
      location: { select: { name: true } },
    },
  });

  return (
    <BackofficeShell identity={r.identity} activeSection="inventory">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-2xl font-semibold">Inventory</h1>
        <span className="text-xs text-ink-soft">
          {packages.length} packages shown (max 100)
        </span>
      </div>

      <form className="mt-4 flex flex-wrap items-end gap-3 rounded-md border border-kraft-300 bg-cream p-3">
        <label className="block">
          <span className="block text-xs text-ink-soft">Status</span>
          <select
            name="status"
            defaultValue={status}
            className="mt-1 rounded-sm border border-kraft-300 bg-paper px-2 py-1 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block flex-1 min-w-48">
          <span className="block text-xs text-ink-soft">
            Search (Metrc tag, product name, SKU)
          </span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            className="mt-1 w-full rounded-sm border border-kraft-300 bg-paper px-2 py-1 font-mono text-sm"
          />
        </label>
        <button
          type="submit"
          className="rounded-sm bg-leaf-700 px-4 py-2 text-sm font-semibold uppercase text-cream hover:bg-leaf-600"
        >
          Apply
        </button>
        <Link href="/inventory" className="text-xs text-ink-soft hover:underline">
          Reset
        </Link>
      </form>

      {packages.length === 0 ? (
        <p className="mt-6 rounded-sm border border-dashed border-kraft-300 bg-paper p-8 text-center text-sm text-ink-soft">
          No packages match. Adjust filters above.
        </p>
      ) : (
        <table className="mt-6 w-full text-left text-sm">
          <thead className="border-b-2 border-kraft-700 text-xs uppercase text-ink-soft">
            <tr>
              <th className="py-2 pr-3">Metrc tag</th>
              <th className="py-2 pr-3">Product</th>
              <th className="py-2 pr-3">Category</th>
              <th className="py-2 pr-3 text-right">Qty</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Location</th>
              <th className="py-2 pr-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-kraft-300">
            {packages.map((p) => (
              <tr key={p.id}>
                <td className="py-2 pr-3 font-mono text-xs">{p.metrcTag}</td>
                <td className="py-2 pr-3">
                  <div className="font-medium">{p.product.name}</div>
                  <div className="font-mono text-xs text-ink-soft">
                    {p.product.sku}
                  </div>
                </td>
                <td className="py-2 pr-3 font-mono text-xs">{p.product.category}</td>
                <td className="py-2 pr-3 text-right font-mono">
                  {Number(p.qty).toFixed(2)} {p.qtyUnit}
                </td>
                <td className="py-2 pr-3">
                  <StatusPill status={p.status} />
                </td>
                <td className="py-2 pr-3 text-xs text-ink-soft">
                  {p.location.name}
                </td>
                <td className="py-2 pr-3 text-right">
                  <Link
                    href={`/inventory/${p.id}`}
                    className="text-xs text-leaf-700 hover:underline"
                  >
                    adjust
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </BackofficeShell>
  );
}

function StatusPill({ status }: { status: string }) {
  const tones: Record<string, string> = {
    AVAILABLE: "bg-leaf-700 text-cream",
    HOLD: "bg-mustard-400 text-ink",
    QUARANTINED: "bg-mustard-400 text-ink",
    RECALLED: "bg-clay-500 text-cream",
    DEPLETED: "bg-kraft-300 text-ink-soft",
    WASTE: "bg-ink text-cream",
    RETURNED: "bg-kraft-100 text-ink-soft",
  };
  const tone = tones[status] ?? "bg-kraft-300 text-ink-soft";
  return (
    <span className={`rounded-sm px-2 py-1 text-xs ${tone}`}>
      {status.toLowerCase()}
    </span>
  );
}
