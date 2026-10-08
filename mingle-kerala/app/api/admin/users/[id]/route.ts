import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { canManageUsers } from "@/lib/admin";
import { apiError, ensureSameOrigin, safeError } from "@/lib/security";
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const invalid = ensureSameOrigin(req); if (invalid) return invalid;
  try {
    const actor = await canManageUsers(req); if (!actor) return apiError("Forbidden", 403);
    const { id } = await context.params;
    const { status, reason } = await req.json();
    if (!["ACTIVE", "SUSPENDED", "BANNED"].includes(status) || typeof reason !== "string" || reason.trim().length < 5 || reason.length > 500) return apiError("Valid status and reason required");
    const target = await db.user.findUnique({ where: { id } });
    if (!target || target.id === actor.id || target.role !== "USER") return apiError("This account cannot be changed", 403);
    await db.$transaction([
      db.user.update({ where: { id }, data: { status } }),
      db.refreshSession.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } }),
      db.moderationAction.create({ data: { moderatorId: actor.id, targetId: id, action: status, reason: reason.trim() } }),
      db.notification.create({ data: { userId: id, type: "MODERATION", title: "Account status changed", body: "Your account status has been updated. Contact support for details.", href: "/dashboard/settings" } })
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) { return safeError(e); }
}
