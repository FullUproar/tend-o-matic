// Idempotent dev seed: one MI tenant, one Ann Arbor location, one
// cashier user. Provides the foreign-key targets the till app needs
// to actually write a Sale row. Run via:
//   pnpm --filter @tend-o-matic/db seed
//
// Re-runs are safe: upsert by stable natural keys (tenant.slug,
// location.licenseNo, user.email).

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TENANT_SLUG = "demo-mi";
const TENANT_LICENSE = "AU-R-000000";
const LOCATION_LICENSE = "AU-R-000123";
const CASHIER_EMAIL = "cashier@demo-mi.tend-o-matic.com";

async function main() {
  console.log("Seeding demo MI tenant…");

  const tenant = await prisma.tenant.upsert({
    where: { slug: TENANT_SLUG },
    update: {},
    create: {
      slug: TENANT_SLUG,
      name: "Demo MI Dispensary",
      licenseNo: TENANT_LICENSE,
      licenseType: "ADULT_USE",
      jurisdiction: "MI",
      locality: "Ann Arbor",
      timezone: "America/Detroit",
      enabledPaymentProviders: ["CASH"],
      featureFlags: { training: true },
    },
  });
  console.log(`  tenant: ${tenant.id} (${tenant.slug})`);

  // Location: upsert by (tenantId, licenseNo) — but Prisma doesn't have
  // a unique on this pair, so use findFirst then create-if-missing.
  let location = await prisma.location.findFirst({
    where: { tenantId: tenant.id, licenseNo: LOCATION_LICENSE },
  });
  if (!location) {
    location = await prisma.location.create({
      data: {
        tenantId: tenant.id,
        name: "Demo Store — Ann Arbor",
        licenseNo: LOCATION_LICENSE,
        addressLine1: "123 Main St",
        city: "Ann Arbor",
        state: "MI",
        postalCode: "48104",
        timezone: "America/Detroit",
      },
    });
  }
  console.log(`  location: ${location.id}`);

  const cashier = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: CASHIER_EMAIL } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: CASHIER_EMAIL,
      passwordHash: "DEV_SEED_NOT_FOR_PRODUCTION",
      name: "Sample Cashier",
      role: "BUDTENDER",
    },
  });
  console.log(`  cashier: ${cashier.id} (${cashier.email})`);

  console.log("\nSeed identifiers (for till app .env / seed-aware code):");
  console.log(`  TENANT_ID=${tenant.id}`);
  console.log(`  LOCATION_ID=${location.id}`);
  console.log(`  CASHIER_USER_ID=${cashier.id}`);
}

main()
  .catch((e) => {
    console.error("seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
