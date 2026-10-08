import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { canManageUsers } from "@/lib/admin";
import { apiError, ensureSameOrigin, safeError } from "@/lib/security";
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const invalid = ensureSameOrigin(req); if (invalid) return invalid;
  try {
    const admin = await canManageUsers(req); if (!admin) return apiError("Forbidden", 403);
    const { id } = await context.params;
    const { decision, bankReceiptConfirmed } = await req.json();
    if (!["VERIFIED", "REJECTED"].includes(decision)) return apiError("Invalid decision");
    if (decision === "VERIFIED" && bankReceiptConfirmed !== true) return apiError("You must independently confirm this payment in the recipient's UPI/bank account", 400);
    const update = await db.payment.updateMany({ where: { id, status: "PENDING_VERIFICATION" }, data: {
      status: decision, verifiedBy: admin.id,
      ...(decision === "VERIFIED" ? { verifiedAt: new Date() } : {})
    } });
    if (update.count !== 1) return apiError("Payment already reviewed or not found", 409);
    return NextResponse.json({ ok: true });
  } catch (e) { return safeError(e); }
}
