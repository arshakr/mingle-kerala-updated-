import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requestUser } from "@/lib/auth";
import { apiError, ensureSameOrigin, throttle, safeError } from "@/lib/security";
export async function POST(req: NextRequest) {
  const invalid = ensureSameOrigin(req); if (invalid) return invalid;
  try {
    const user = await requestUser(req); if (!user) return apiError("Unauthenticated", 401);
    if (!await throttle(`report:${user.id}`, 8, 86400)) return apiError("Report rate limit reached", 429);
    const { userId, reason, details } = await req.json();
    const reasons = ["SPAM", "HARASSMENT", "ABUSE", "SEXUAL_HARASSMENT", "FAKE_PROFILE", "UNDERAGE", "SCAM", "THREATS", "OTHER"];
    if (typeof userId !== "string" || userId === user.id || !reasons.includes(reason) || typeof details !== "string" || details.length > 1000) return apiError("Invalid report");
    const report = await db.report.create({ data: { reporterId: user.id, reportedId: userId, reason, details } });
    return NextResponse.json({ reportId: report.id }, { status: 201 });
  } catch (e) { return safeError(e); }
}
