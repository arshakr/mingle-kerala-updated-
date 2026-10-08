import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminFromRequest } from "@/lib/admin";
import { apiError } from "@/lib/security";
export async function GET(req: NextRequest) {
  if (!await adminFromRequest(req)) return apiError("Forbidden", 403);
  const reports = await db.report.findMany({ orderBy: { createdAt: "desc" }, take: 100,
    include: { reporter: { select: { username: true } }, reported: { select: { username: true, status: true } } } });
  return NextResponse.json({ reports });
}
