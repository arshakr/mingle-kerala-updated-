import { NextRequest, NextResponse } from "next/server";
import { rotateSession, clearCookies } from "@/lib/auth";
import { ensureSameOrigin, apiError, safeError } from "@/lib/security";
export async function POST(req: NextRequest) {
  const invalid = ensureSameOrigin(req); if (invalid) return invalid;
  try { const res = NextResponse.json({ ok: true }); if (await rotateSession(req, res)) return res; clearCookies(res); return apiError("Session expired", 401); }
  catch (e) { return safeError(e); }
}
