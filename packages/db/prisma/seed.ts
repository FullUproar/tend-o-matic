// Idempotent dev seed: one MI tenant, one Ann Arbor location, one
// cashier user. Provides the foreign-key targets the till app needs
// to actually write a Sale row. Run via:
//   pnpm --filter @tend-o-matic/db seed
//
// Re-runs are safe: upsert by stable natural keys (tenant.slug,
// location.licenseNo, user.email).

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const TENANT_SLUG = "demo-mi";
const TENANT_LICENSE = "AU-R-000000";
const LOCATION_LICENSE = "AU-R-000123";
const CASHIER_EMAIL = "cashier@demo-mi.tend-o-matic.com";
const MANAGER_EMAIL = "manager@demo-mi.tend-o-matic.com";
// Demo-only password (same for both demo users). Production users get
// their password set via the backoffice user-management UI (M5).
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "demopass";

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

  const passwordHash = await hash(DEMO_PASSWORD, 12);
  const cashier = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: CASHIER_EMAIL } },
    update: { passwordHash }, // re-hash on every re-run so password changes take effect
    create: {
      tenantId: tenant.id,
      email: CASHIER_EMAIL,
      passwordHash,
      name: "Sample Cashier",
      role: "BUDTENDER",
    },
  });
  console.log(`  cashier: ${cashier.id} (${cashier.email})`);

  const manager = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: MANAGER_EMAIL } },
    update: { passwordHash },
    create: {
      tenantId: tenant.id,
      email: MANAGER_EMAIL,
      passwordHash,
      name: "Sample Manager",
      role: "MANAGER",
    },
  });
  console.log(`  manager: ${manager.id} (${manager.email})`);
  console.log(`  password (both users): ${DEMO_PASSWORD} (override via DEMO_PASSWORD env)`);

  // Sample products. Idempotent via upsert by (tenantId, sku). Each
  // product gets one default Package so the till has something to sell.
  const sampleProducts = [
    {
      sku: "demo-flower-blue-dream",
      name: "Blue Dream",
      category: "FLOWER" as const,
      strain: "Blue Dream",
      brand: "Demo Farms",
      thcD9Pct: 22.5,
      thcaPct: 0.4,
    },
    {
      sku: "demo-flower-northern-lights",
      name: "Northern Lights",
      category: "FLOWER" as const,
      strain: "Northern Lights",
      brand: "Demo Farms",
      thcD9Pct: 18.2,
      thcaPct: 0.3,
    },
    {
      sku: "demo-preroll-blue-dream-1g",
      name: "Blue Dream Pre-Roll 1g",
      category: "PRE_ROLL" as const,
      strain: "Blue Dream",
      brand: "Demo Farms",
      thcD9Pct: 22.5,
      thcaPct: 0.4,
    },
    {
      sku: "demo-concentrate-live-rosin",
      name: "Live Rosin",
      category: "CONCENTRATE" as const,
      strain: "Wedding Cake",
      brand: "Demo Extracts",
      thcD9Pct: 72.0,
      thcaPct: 4.0,
    },
    {
      sku: "demo-edible-gummy-100mg",
      name: "Mixed Berry Gummies 100mg",
      category: "EDIBLE" as const,
      brand: "Demo Confections",
      thcMg: 100,
    },
    {
      sku: "demo-infused-tincture-200mg",
      name: "Sleep Tincture 200mg",
      category: "INFUSED" as const,
      brand: "Demo Wellness",
      thcMg: 200,
    },
  ];

  for (const p of sampleProducts) {
    const adjustedThcPct =
      p.thcD9Pct !== undefined || p.thcaPct !== undefined
        ? (p.thcD9Pct ?? 0) + 0.877 * (p.thcaPct ?? 0)
        : null;
    const prod = await prisma.product.upsert({
      where: { tenantId_sku: { tenantId: tenant.id, sku: p.sku } },
      update: {
        name: p.name,
        category: p.category,
        strain: p.strain ?? null,
        brand: p.brand ?? null,
        thcD9Pct: p.thcD9Pct ?? null,
        thcaPct: p.thcaPct ?? null,
        thcMg: p.thcMg ?? null,
        adjustedThcPct,
      },
      create: {
        tenantId: tenant.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        strain: p.strain ?? null,
        brand: p.brand ?? null,
        thcD9Pct: p.thcD9Pct ?? null,
        thcaPct: p.thcaPct ?? null,
        thcMg: p.thcMg ?? null,
        adjustedThcPct,
        isActive: true,
      },
    });
    const metrcTag = `DEMO-PKG-${p.sku}`;
    await prisma.package.upsert({
      where: { tenantId_metrcTag: { tenantId: tenant.id, metrcTag } },
      update: {},
      create: {
        tenantId: tenant.id,
        locationId: location.id,
        productId: prod.id,
        metrcTag,
        qty: 10000,
        qtyUnit: p.category === "INFUSED" || p.category === "EDIBLE" ? "MG_THC" : "G",
        status: "AVAILABLE",
        tested: true,
        labeled: true,
        recalled: false,
      },
    });
  }
  console.log(`  ${sampleProducts.length} sample products + packages`);

  // De-list legacy lazy products from the M2.5c "ensureDemoPackage"
  // code path (now deleted). Their orphan packages get marked WASTE so
  // they stop showing up as sellable inventory. Idempotent: if the
  // rows don't exist, the updateMany is a no-op.
  const legacySkuPrefixes = ["demo-flower-g", "demo-flower-oz", "demo-concentrate-g"];
  for (const sku of legacySkuPrefixes) {
    const legacy = await prisma.product.findFirst({
      where: { tenantId: tenant.id, sku },
      select: { id: true },
    });
    if (!legacy) continue;
    await prisma.product.update({
      where: { id: legacy.id },
      data: { isActive: false },
    });
    await prisma.package.updateMany({
      where: { tenantId: tenant.id, productId: legacy.id, status: "AVAILABLE" },
      data: { status: "WASTE" },
    });
    console.log(`  cleaned up legacy product ${sku}`);
  }

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
