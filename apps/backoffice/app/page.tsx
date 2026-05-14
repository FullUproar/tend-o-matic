import { redirect } from "next/navigation";
import { loadBackofficeIdentity } from "../lib/identity";
import { BackofficeShell } from "../components/BackofficeShell";

export const dynamic = "force-dynamic";

export default async function Page() {
  const r = await loadBackofficeIdentity();
  if (!r.ok) {
    if (r.reason === "UNAUTHENTICATED") redirect("/sign-in");
    redirect("/forbidden");
  }
  return (
    <BackofficeShell identity={r.identity} activeSection="dashboard">
      <div className="max-w-3xl">
        <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Welcome, {r.identity.userName}. The dashboard shows live KPIs in M5
          (sales report, inventory health, refusal-rate metrics). For now,
          head over to the{" "}
          <a className="font-medium text-leaf-700 underline" href="/products">
            Products
          </a>{" "}
          page to manage the catalog.
        </p>
      </div>
    </BackofficeShell>
  );
}
