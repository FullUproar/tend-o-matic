import { notFound, redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { loadBackofficeIdentity } from "../../../../lib/identity";
import { BackofficeShell } from "../../../../components/BackofficeShell";
import { ProductForm } from "../../../../components/ProductForm";
import { updateProductAction, setProductActiveAction } from "../../actions";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function EditProductPage({
  params,
}: {
  params: Params;
}) {
  const r = await loadBackofficeIdentity();
  if (!r.ok) {
    if (r.reason === "UNAUTHENTICATED") redirect("/sign-in");
    redirect("/forbidden");
  }

  const product = await prisma.product.findFirst({
    where: { id: params.id, tenantId: r.identity.tenantId },
  });
  if (!product) notFound();

  const boundUpdate = updateProductAction.bind(null, product.id);
  const toggleActive = async () => {
    "use server";
    await setProductActiveAction(product.id, !product.isActive);
  };

  return (
    <BackofficeShell identity={r.identity} activeSection="products">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">{product.name}</h1>
          <p className="mt-1 font-mono text-xs text-ink-soft">{product.sku}</p>
        </div>
        <form action={toggleActive}>
          <button
            type="submit"
            className={`rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
              product.isActive
                ? "border border-clay-500 text-clay-700 hover:bg-clay-500 hover:text-cream"
                : "border border-leaf-700 text-leaf-700 hover:bg-leaf-700 hover:text-cream"
            }`}
          >
            {product.isActive ? "De-list" : "Re-list"}
          </button>
        </form>
      </div>

      <div className="mt-6 max-w-3xl">
        <ProductForm
          action={boundUpdate}
          initial={{
            sku: product.sku,
            name: product.name,
            category: product.category,
            brand: product.brand,
            strain: product.strain,
            description: product.description,
            thcD9Pct: product.thcD9Pct ? Number(product.thcD9Pct) : null,
            thcaPct: product.thcaPct ? Number(product.thcaPct) : null,
            adjustedThcPct: product.adjustedThcPct
              ? Number(product.adjustedThcPct)
              : null,
            thcMg: product.thcMg ? Number(product.thcMg) : null,
            cbdMg: product.cbdMg ? Number(product.cbdMg) : null,
            labCoaUrl: product.labCoaUrl,
          }}
          submitLabel="Save changes"
        />
      </div>
    </BackofficeShell>
  );
}
