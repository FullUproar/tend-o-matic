"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../lib/auth";

const prisma = new PrismaClient();

type ProductWriteInput = {
  sku: string;
  name: string;
  category: string;
  strain: string | null;
  brand: string | null;
  description: string | null;
  thcD9Pct: number | null;
  thcaPct: number | null;
  thcMg: number | null;
  cbdMg: number | null;
  labCoaUrl: string | null;
};

// IL adjusted-THC formula: Δ9-THC% + 0.877 × THCA%. Persist when both
// raw values are present; null otherwise so the tax engine can detect
// "not yet known" and refuse with TAX_INPUT_MISSING.
function computeAdjustedThc(
  thcD9Pct: number | null,
  thcaPct: number | null,
): number | null {
  if (thcD9Pct === null && thcaPct === null) return null;
  return (thcD9Pct ?? 0) + 0.877 * (thcaPct ?? 0);
}

function parseForm(form: FormData): ProductWriteInput {
  const get = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v.trim() : "";
  };
  const num = (k: string): number | null => {
    const s = get(k);
    if (s === "") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };
  return {
    sku: get("sku"),
    name: get("name"),
    category: get("category"),
    strain: get("strain") || null,
    brand: get("brand") || null,
    description: get("description") || null,
    thcD9Pct: num("thcD9Pct"),
    thcaPct: num("thcaPct"),
    thcMg: num("thcMg"),
    cbdMg: num("cbdMg"),
    labCoaUrl: get("labCoaUrl") || null,
  };
}

async function requireManager() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in.");
  const role = session.user.role;
  if (role !== "MANAGER" && role !== "ADMIN") {
    throw new Error(`Insufficient role: ${role}`);
  }
  return session.user;
}

export async function createProductAction(form: FormData) {
  const user = await requireManager();
  const input = parseForm(form);
  if (!input.sku || !input.name || !input.category) {
    throw new Error("sku, name, and category are required.");
  }
  const adjustedThcPct = computeAdjustedThc(input.thcD9Pct, input.thcaPct);

  const product = await prisma.product.create({
    data: {
      tenantId: user.tenantId,
      sku: input.sku,
      name: input.name,
      category: input.category as never,
      strain: input.strain,
      brand: input.brand,
      description: input.description,
      thcD9Pct: input.thcD9Pct as never,
      thcaPct: input.thcaPct as never,
      thcMg: input.thcMg as never,
      cbdMg: input.cbdMg as never,
      adjustedThcPct: adjustedThcPct as never,
      labCoaUrl: input.labCoaUrl,
      isActive: true,
    },
  });
  revalidatePath("/products");
  redirect(`/products/${product.id}/edit`);
}

export async function updateProductAction(productId: string, form: FormData) {
  const user = await requireManager();
  const input = parseForm(form);
  if (!input.sku || !input.name || !input.category) {
    throw new Error("sku, name, and category are required.");
  }
  const adjustedThcPct = computeAdjustedThc(input.thcD9Pct, input.thcaPct);
  await prisma.product.update({
    where: { id: productId, tenantId: user.tenantId }, // tenant scope guard
    data: {
      sku: input.sku,
      name: input.name,
      category: input.category as never,
      strain: input.strain,
      brand: input.brand,
      description: input.description,
      thcD9Pct: input.thcD9Pct as never,
      thcaPct: input.thcaPct as never,
      thcMg: input.thcMg as never,
      cbdMg: input.cbdMg as never,
      adjustedThcPct: adjustedThcPct as never,
      labCoaUrl: input.labCoaUrl,
    },
  });
  revalidatePath("/products");
  revalidatePath(`/products/${productId}/edit`);
}

export async function setProductActiveAction(
  productId: string,
  isActive: boolean,
) {
  const user = await requireManager();
  await prisma.product.update({
    where: { id: productId, tenantId: user.tenantId },
    data: { isActive },
  });
  revalidatePath("/products");
  revalidatePath(`/products/${productId}/edit`);
}
