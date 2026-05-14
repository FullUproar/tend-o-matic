"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@tend-o-matic/auth-runtime";
import { auth } from "../../lib/auth";

const prisma = new PrismaClient();

export async function voidSaleAction(saleId: string, form: FormData) {
  const session = await auth();
  requirePermission(session, "till.sale.void");
  const tenantId = session.user.tenantId;
  const voiderUserId = session.user.id;
  const reason = String(form.get("reason") ?? "").trim();
  if (reason.length < 3) {
    throw new Error("Void reason must be at least 3 characters.");
  }

  // Atomic void: sale status flip + per-line package qty restoration
  // + same-transaction audit row. M3.2 wires the inventory side of
  // the void event. Tender refund (cash drawer / cashless ATM) is
  // still TODO — voiding a sale flags the audit row; reconciliation
  // queue (M5+) handles the money side.
  await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findFirst({
      where: { id: saleId, tenantId },
      select: {
        id: true,
        status: true,
        subtotalCents: true,
        taxCents: true,
        totalCents: true,
        items: {
          select: {
            packageId: true,
            weightValue: true,
            qty: true,
          },
        },
      },
    });
    if (!sale) throw new Error(`Sale not found: ${saleId}`);
    if (sale.status !== "COMPLETE") {
      throw new Error(`Cannot void a sale with status ${sale.status}.`);
    }
    await tx.sale.update({
      where: { id: saleId },
      data: {
        status: "VOIDED",
        voidedAt: new Date(),
        voidedByUserId: voiderUserId,
        voidReason: reason,
      },
    });

    // Restore each line's qty to its package and un-deplete if needed.
    for (const item of sale.items) {
      const restore = Number(item.weightValue) * Number(item.qty);
      await tx.package.update({
        where: { id: item.packageId },
        data: { qty: { increment: restore } },
      });
      // Re-mark the package AVAILABLE if it was DEPLETED.
      await tx.package.updateMany({
        where: { id: item.packageId, tenantId, status: "DEPLETED" },
        data: { status: "AVAILABLE" },
      });
    }

    await tx.auditLog.create({
      data: {
        tenantId,
        actorUserId: voiderUserId,
        entityType: "sale",
        entityId: saleId,
        action: "voided",
        payload: {
          reason,
          subtotalCents: Number(sale.subtotalCents),
          taxCents: Number(sale.taxCents),
          totalCents: Number(sale.totalCents),
          inventoryRestored: sale.items.map((i) => ({
            packageId: i.packageId,
            weightValue: Number(i.weightValue),
            qty: Number(i.qty),
          })),
        },
      },
    });
  });

  revalidatePath("/sales");
  revalidatePath(`/sales/${saleId}`);
  redirect(`/sales/${saleId}`);
}
