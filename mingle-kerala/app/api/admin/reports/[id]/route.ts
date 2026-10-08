import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminFromRequest } from "@/lib/admin";
import { apiError, ensureSameOrigin, safeError } from "@/lib/security";
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const invalid = ensureSameOrigin(req); if (invalid) return invalid;
  try {
    const actor = await adminFromRequest(req); if (!actor) return apiError("Forbidden", 403);
    const { id } = await context.params;
    const { decision } = await req.json();
    if (!["REVIEWED", "DISMISSED", "ACTIONED"].includes(decision)) return apiError("Invalid review decision");
    const report = await db.report.findUnique({ where: { id } }); if (!report) return apiError("Report not found", 404);
    await db.$transaction([ db.report.update({ where: { id }, data: { status: decision } }), db.moderationAction.create({ data: {
      moderatorId: actor.id, targetId: report.reportedId, action: `REPORT_${decision}`, reason: `Report ${id}: ${report.reason}`
    } }) ]);
    return NextResponse.json({ ok: true });
  } catch (e) { return safeError(e); }
}
