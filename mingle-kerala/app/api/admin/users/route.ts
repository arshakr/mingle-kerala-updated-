import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { canManageUsers } from "@/lib/admin";
import { apiError } from "@/lib/security";
export async function GET(req: NextRequest) {
  if (!await canManageUsers(req)) return apiError("Forbidden", 403);
  const q = req.nextUrl.searchParams.get("q")?.trim().slice(0, 50);
  const users = await db.user.findMany({ where: q ? { OR: [{ username: { contains: q, mode: "insensitive" } }, { id: q }] } : {},
    select: { id: true, username: true, district: true, status: true, role: true, createdAt: true }, take: 100, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ users });
}
