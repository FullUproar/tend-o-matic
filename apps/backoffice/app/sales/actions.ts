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

  // Atomic void: sale status flip + same-transaction audit row.
  await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findFirst({
      where: { id: saleId, tenantId },
      select: { id: true, status: true, subtotalCents: true, taxCents: true, totalCents: true },
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
        },
      },
    });
    // Inventory restoration + tender refund tied to this void event
    // land with M3.2 (inventory decrement work) and a future tender-
    // refund PR. For now the audit row is the durable record that the
    // sale was voided; downstream systems reconcile via that row.
  });

  revalidatePath("/sales");
  revalidatePath(`/sales/${saleId}`);
  redirect(`/sales/${saleId}`);
}
