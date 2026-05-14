import { loadSeedIdentity } from "../lib/identity";
import { TillShell } from "../components/TillShell";

export const dynamic = "force-dynamic";

export default async function Page() {
  const identity = await loadSeedIdentity();
  return <TillShell identity={identity} />;
}
