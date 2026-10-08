import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { canManageUsers } from "@/lib/admin";
import { apiError } from "@/lib/security";
export async function GET(req: NextRequest) {
  if (!await canManageUsers(req)) return apiError("Forbidden", 403);
  const payments = await db.payment.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: {
    id: true, email: true, utr: true, upiId: true, amountPaise: true, status: true,
    createdAt: true, verifiedAt: true, activatedAt: true, verifiedBy: true
  } });
  return NextResponse.json({ payments });
}
