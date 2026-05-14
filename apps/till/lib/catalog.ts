// Server-only product catalog loader. Returns the active products
// (with at least one available Package) for the signed-in tenant so
// the till can render the picker. M3.2 will add inventory-aware
// filtering; for now any AVAILABLE package with qty > 0 counts.

import "server-only";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type CatalogProduct = {
  id: string;
  sku: string;
  name: string;
  category:
    | "FLOWER"
    | "PRE_ROLL"
    | "CONCENTRATE"
    | "EDIBLE"
    | "INFUSED"
    | "TOPICAL"
    | "IMMATURE_PLANT"
    | "OTHER";
  brand: string | null;
  strain: string | null;
  thcMg: number | null;
  cbdMg: number | null;
  adjustedThcPct: number | null;
  // Tracking unit on packages of this product. Determines what units
  // the till's weight input should expect.
  defaultWeightUnit: "G" | "OZ" | "MG_THC" | "UNITS";
};

export async function loadCatalog(tenantId: string): Promise<CatalogProduct[]> {
  const products = await prisma.product.findMany({
    where: {
      tenantId,
      isActive: true,
      packages: { some: { status: "AVAILABLE" } },
    },
    select: {
      id: true,
      sku: true,
      name: true,
      category: true,
      brand: true,
      strain: true,
      thcMg: true,
      cbdMg: true,
      adjustedThcPct: true,
      packages: {
        where: { status: "AVAILABLE" },
        select: { qtyUnit: true },
        take: 1,
      },
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return products.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category,
    brand: p.brand,
    strain: p.strain,
    thcMg: p.thcMg ? Number(p.thcMg) : null,
    cbdMg: p.cbdMg ? Number(p.cbdMg) : null,
    adjustedThcPct: p.adjustedThcPct ? Number(p.adjustedThcPct) : null,
    defaultWeightUnit: (p.packages[0]?.qtyUnit ?? "G") as CatalogProduct["defaultWeightUnit"],
  }));
}
