// Server-only seed-identity loader. Reads the demo cashier/location/
// tenant that packages/db/prisma/seed.ts wrote, by stable natural keys.
// Real auth (M4) replaces this with a session callback.

import "server-only";
import { PrismaClient } from "@prisma/client";

const TENANT_SLUG = "demo-mi";
const CASHIER_EMAIL = "cashier@demo-mi.tend-o-matic.com";

const prisma = new PrismaClient();

export type SeedIdentity = {
  tenantId: string;
  tenantName: string;
  tenantTraining: boolean;
  locationId: string;
  locationName: string;
  locationLicense: string;
  cashierUserId: string;
  cashierName: string;
};

export async function loadSeedIdentity(): Promise<SeedIdentity> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: TENANT_SLUG },
  });
  if (!tenant) {
    throw new Error(
      `Seed identity missing. Run: pnpm --filter @tend-o-matic/db seed`,
    );
  }
  const location = await prisma.location.findFirst({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "asc" },
  });
  if (!location) {
    throw new Error("Seed identity is missing a location row");
  }
  const cashier = await prisma.user.findUnique({
    where: { tenantId_email: { tenantId: tenant.id, email: CASHIER_EMAIL } },
  });
  if (!cashier) {
    throw new Error("Seed identity is missing the cashier user row");
  }

  const flags = (tenant.featureFlags ?? {}) as Record<string, unknown>;
  return {
    tenantId: tenant.id,
    tenantName: tenant.name,
    tenantTraining: Boolean(flags.training),
    locationId: location.id,
    locationName: location.name,
    locationLicense: location.licenseNo,
    cashierUserId: cashier.id,
    cashierName: cashier.name ?? cashier.email,
  };
}
