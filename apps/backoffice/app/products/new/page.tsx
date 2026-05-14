import { redirect } from "next/navigation";
import { loadBackofficeIdentity } from "../../../lib/identity";
import { BackofficeShell } from "../../../components/BackofficeShell";
import { ProductForm } from "../../../components/ProductForm";
import { createProductAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const r = await loadBackofficeIdentity();
  if (!r.ok) {
    if (r.reason === "UNAUTHENTICATED") redirect("/sign-in");
    redirect("/forbidden");
  }
  return (
    <BackofficeShell identity={r.identity} activeSection="products">
      <h1 className="font-display text-2xl font-semibold">New product</h1>
      <p className="mt-1 text-sm text-ink-soft">
        SKU and name are required. THC values feed the IL adjusted-THC tax
        engine.
      </p>
      <div className="mt-6 max-w-3xl">
        <ProductForm action={createProductAction} submitLabel="Create product" />
      </div>
    </BackofficeShell>
  );
}
