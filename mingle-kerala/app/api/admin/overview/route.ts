import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminFromRequest } from "@/lib/admin";
import { apiError } from "@/lib/security";
export async function GET(req: NextRequest) {
  if (!await adminFromRequest(req)) return apiError("Forbidden", 403);
  const [users, pendingPayments, verifiedPayments, reports, suspended, conversations, recentUsers] = await Promise.all([
    db.user.count(), db.payment.count({ where: { status: "PENDING_VERIFICATION" } }),
    db.payment.count({ where: { status: "VERIFIED" } }),
    db.report.count({ where: { status: "PENDING" } }),
    db.user.count({ where: { status: "SUSPENDED" } }), db.conversation.count(),
    db.user.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 86400_000) } } })
  ]);
  return NextResponse.json({ users, pendingPayments, verifiedPayments, reports, suspended, conversations, recentUsers, revenueRupees: verifiedPayments * 25 });
}
