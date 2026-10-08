import { NextRequest, NextResponse } from "next/server";
import { revokeCurrentRefresh, clearCookies } from "@/lib/auth";
import { ensureSameOrigin, safeError } from "@/lib/security";
export async function POST(req: NextRequest) {
  const invalid = ensureSameOrigin(req); if (invalid) return invalid;
  try { await revokeCurrentRefresh(req); const res = NextResponse.json({ ok: true }); clearCookies(res); return res; }
  catch (e) { return safeError(e); }
}
