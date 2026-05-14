import { redirect } from "next/navigation";
import { loadSessionIdentity } from "../lib/identity";
import { loadCatalog } from "../lib/catalog";
import { TillShell } from "../components/TillShell";

export const dynamic = "force-dynamic";

export default async function Page() {
  const identity = await loadSessionIdentity();
  if (!identity) redirect("/sign-in");
  const catalog = await loadCatalog(identity.tenantId);
  return <TillShell identity={identity} catalog={catalog} />;
}
