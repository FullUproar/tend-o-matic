import "server-only";
import { PrismaClient } from "@prisma/client";
import { auth } from "./auth";

const prisma = new PrismaClient();

export type BackofficeIdentity = {
  tenantId: string;
  tenantName: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: "BUDTENDER" | "MANAGER" | "ADMIN";
};

// loadBackofficeIdentity returns the session identity OR a role-gate
// refusal. Backoffice routes are gated to MANAGER + ADMIN only;
// BUDTENDER signing in here gets bounced to the till.
export type LoadResult =
  | { ok: true; identity: BackofficeIdentity }
  | { ok: false; reason: "UNAUTHENTICATED" | "INSUFFICIENT_ROLE" };

export async function loadBackofficeIdentity(): Promise<LoadResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, reason: "UNAUTHENTICATED" };

  const { tenantId, role, id: userId } = session.user;
  if (role !== "MANAGER" && role !== "ADMIN") {
    return { ok: false, reason: "INSUFFICIENT_ROLE" };
  }

  const [tenant, user] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
  ]);
  if (!tenant || !user) return { ok: false, reason: "UNAUTHENTICATED" };

  return {
    ok: true,
    identity: {
      tenantId,
      tenantName: tenant.name,
      userId,
      userName: user.name ?? user.email,
      userEmail: user.email,
      role,
    },
  };
}
