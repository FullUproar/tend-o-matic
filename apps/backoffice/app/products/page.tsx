import Link from "next/link";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { loadBackofficeIdentity } from "../../lib/identity";
import { BackofficeShell } from "../../components/BackofficeShell";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const r = await loadBackofficeIdentity();
  if (!r.ok) {
    if (r.reason === "UNAUTHENTICATED") redirect("/sign-in");
    redirect("/forbidden");
  }

  const products = await prisma.product.findMany({
    where: { tenantId: r.identity.tenantId },
    orderBy: [{ isActive: "desc" }, { category: "asc" }, { name: "asc" }],
    select: {
      id: true,
      sku: true,
      name: true,
      category: true,
      brand: true,
      strain: true,
      isActive: true,
      adjustedThcPct: true,
    },
  });

  return (
    <BackofficeShell identity={r.identity} activeSection="products">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Products</h1>
        <Link
          href="/products/new"
          className="rounded-sm bg-leaf-700 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-cream hover:bg-leaf-600"
        >
          New product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-8 rounded-sm border border-dashed border-kraft-300 bg-paper px-4 py-8 text-center text-sm text-ink-soft">
          No products yet. Click <span className="font-medium">New product</span>{" "}
          to add one.
        </p>
      ) : (
        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-kraft-700 text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Strain</th>
              <th className="px-3 py-2">Brand</th>
              <th className="px-3 py-2 text-right">Adj. THC %</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-kraft-300">
                <td className="px-3 py-2 font-mono text-xs">{p.sku}</td>
                <td className="px-3 py-2">
                  <Link
                    href={`/products/${p.id}/edit`}
                    className="text-leaf-700 hover:underline"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="px-3 py-2 font-mono text-xs">{p.category}</td>
                <td className="px-3 py-2 text-ink-soft">{p.strain ?? "—"}</td>
                <td className="px-3 py-2 text-ink-soft">{p.brand ?? "—"}</td>
                <td className="px-3 py-2 text-right font-mono">
                  {p.adjustedThcPct ? Number(p.adjustedThcPct).toFixed(3) : "—"}
                </td>
                <td className="px-3 py-2">
                  {p.isActive ? (
                    <span className="rounded-sm bg-leaf-300 px-2 py-0.5 text-xs text-leaf-900">
                      active
                    </span>
                  ) : (
                    <span className="rounded-sm bg-kraft-300 px-2 py-0.5 text-xs text-ink-soft">
                      inactive
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <Link
                    href={`/products/${p.id}/edit`}
                    className="text-xs text-ink-soft hover:text-ink"
                  >
                    edit
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
