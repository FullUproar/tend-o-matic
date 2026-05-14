// Server-side session identity loader. Replaces the M2.5b seed
// shortcut: now reads the NextAuth session for the signed-in cashier
// and joins to the tenant + location rows for display fields.
//
// Returns null when no session is present; the page redirects to
// /sign-in in that case.

import "server-only";
import { PrismaClient } from "@prisma/client";
import { auth } from "./auth";

const prisma = new PrismaClient();

export type SessionIdentity = {
  tenantId: string;
  tenantName: string;
  tenantTraining: boolean;
  locationId: string;
  locationName: string;
  locationLicense: string;
  cashierUserId: string;
  cashierName: string;
  cashierRole: "BUDTENDER" | "MANAGER" | "ADMIN";
};

export async function loadSessionIdentity(): Promise<SessionIdentity | null> {
  const session = await auth();
  if (!session?.user) return null;
  const { tenantId, locationId, id: userId, role } = session.user;
  if (!locationId) {
    throw new Error(
      `User ${userId} has no location assigned. M4.3 device registration will resolve this; for now, ensure the tenant has at least one Location row.`,
    );
  }

  const [tenant, location, user] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, featureFlags: true },
    }),
    prisma.location.findUnique({
      where: { id: locationId },
      select: { name: true, licenseNo: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
  ]);

  if (!tenant || !location || !user) {
    throw new Error(
      `Session references missing rows (tenant=${!!tenant} location=${!!location} user=${!!user}).`,
    );
  }

  const flags = (tenant.featureFlags ?? {}) as Record<string, unknown>;
  return {
    tenantId,
    tenantName: tenant.name,
    tenantTraining: Boolean(flags.training),
    locationId,
    locationName: location.name,
    locationLicense: location.licenseNo,
    cashierUserId: userId,
    cashierName: user.name ?? user.email,
    cashierRole: role,
  };
}
