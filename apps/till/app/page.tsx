import { redirect } from "next/navigation";
import { loadSessionIdentity } from "../lib/identity";
import { TillShell } from "../components/TillShell";

export const dynamic = "force-dynamic";

export default async function Page() {
  const identity = await loadSessionIdentity();
  if (!identity) redirect("/sign-in");
  return <TillShell identity={identity} />;
}
