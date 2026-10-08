import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requestUser } from "@/lib/auth";
import { apiError, ensureSameOrigin, safeError } from "@/lib/security";
export async function GET(req: NextRequest) {
  const user = await requestUser(req); if (!user) return apiError("Unauthenticated", 401);
  const notifications = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 70 });
  return NextResponse.json({ notifications });
}
export async function PATCH(req: NextRequest) {
  const invalid = ensureSameOrigin(req); if (invalid) return invalid;
  try {
    const user = await requestUser(req); if (!user) return apiError("Unauthenticated", 401);
    const { id } = await req.json();
    await db.notification.updateMany({ where: { userId: user.id, ...(typeof id === "string" ? { id } : {}), readAt: null }, data: { readAt: new Date() } });
    return NextResponse.json({ ok: true });
  } catch (e) { return safeError(e); }
}
