"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@tend-o-matic/auth-runtime";
import { auth } from "../../lib/auth";

const prisma = new PrismaClient();

async function requireMgmt() {
  const session = await auth();
  // backoffice.product.write is the closest existing perm covering
  // inventory mutations. M4.2's permission set will grow to add a
  // dedicated inventory.adjust permission later.
  requirePermission(session, "backoffice.product.write");
  return session.user;
}

export async function adjustPackageQtyAction(
  packageId: string,
  form: FormData,
) {
  const user = await requireMgmt();
  const delta = Number(form.get("delta"));
  const reason = String(form.get("reason") ?? "").trim();
  if (!Number.isFinite(delta) || delta === 0) {
    throw new Error("Delta must be a non-zero number.");
  }
  if (reason.length < 3) {
    throw new Error("Reason must be at least 3 characters.");
  }

  await prisma.$transaction(async (tx) => {
    const pkg = await tx.package.findFirst({
      where: { id: packageId, tenantId: user.tenantId },
      select: { id: true, qty: true, status: true },
    });
    if (!pkg) throw new Error(`Package not found: ${packageId}`);
    const newQty = Number(pkg.qty) + delta;
    if (newQty < 0) {
      throw new Error(
        `Adjustment would push qty below 0 (current ${pkg.qty}, delta ${delta}).`,
      );
    }
    await tx.package.update({
      where: { id: packageId },
      data: { qty: newQty },
    });
    // Auto-flip status when qty crosses 0 in either direction.
    if (newQty === 0 && pkg.status === "AVAILABLE") {
      await tx.package.update({
        where: { id: packageId },
        data: { status: "DEPLETED" },
      });
    } else if (newQty > 0 && pkg.status === "DEPLETED") {
      await tx.package.update({
        where: { id: packageId },
        data: { status: "AVAILABLE" },
      });
    }
    await tx.auditLog.create({
      data: {
        tenantId: user.tenantId,
        actorUserId: user.id,
        entityType: "package",
        entityId: packageId,
        action: "qty_adjusted",
        payload: {
          delta,
          previousQty: Number(pkg.qty),
          newQty,
          reason,
        },
      },
    });
  });

  revalidatePath("/inventory");
  revalidatePath(`/inventory/${packageId}`);
}

const VALID_STATUSES = new Set([
  "AVAILABLE",
  "HOLD",
  "QUARANTINED",
  "RECALLED",
  "DEPLETED",
  "WASTE",
  "RETURNED",
]);

export async function setPackageStatusAction(
  packageId: string,
  form: FormData,
) {
  const user = await requireMgmt();
  const status = String(form.get("status") ?? "");
  const reason = String(form.get("reason") ?? "").trim();
  if (!VALID_STATUSES.has(status)) {
    throw new Error(`Invalid status: ${status}`);
  }
  if (reason.length < 3) {
    throw new Error("Reason must be at least 3 characters.");
  }

  await prisma.$transaction(async (tx) => {
    const pkg = await tx.package.findFirst({
      where: { id: packageId, tenantId: user.tenantId },
      select: { id: true, status: true },
    });
    if (!pkg) throw new Error(`Package not found: ${packageId}`);
    if (pkg.status === status) {
      // No-op; still write an audit row so reason is captured.
    }
    await tx.package.update({
      where: { id: packageId },
      data: { status: status as never },
    });
    await tx.auditLog.create({
      data: {
        tenantId: user.tenantId,
        actorUserId: user.id,
        entityType: "package",
        entityId: packageId,
        action: "status_changed",
        payload: {
          previousStatus: pkg.status,
          newStatus: status,
          reason,
        },
      },
    });
  });

  revalidatePath("/inventory");
  revalidatePath(`/inventory/${packageId}`);
}
