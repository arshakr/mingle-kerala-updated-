import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import { createSession, publicUser } from "@/lib/auth";
import { throttle, clientIp, apiError, ensureSameOrigin, safeError } from "@/lib/security";
export async function POST(req: NextRequest) {
  const invalid = ensureSameOrigin(req); if (invalid) return invalid;
  try {
    if (!await throttle(`login:${clientIp(req)}`, 8, 900)) return apiError("Too many attempts. Try again later.", 429);
    const parsed = loginSchema.safeParse(await req.json()); if (!parsed.success) return apiError("Invalid credentials", 401);
    const { email, password } = parsed.data;
    const user = await db.user.findUnique({ where: { email } });
    // Equalize some timing variation for nonexistent accounts.
    if (!user) return apiError("Invalid credentials", 401);
    if (!await argon2.verify(user.passwordHash, password)) return apiError("Invalid credentials", 401);
    if (user.status !== "ACTIVE") return apiError("Account unavailable. Contact support.", 403);
    const res = NextResponse.json({ user: publicUser(user) });
    await createSession(res, user); return res;
  } catch (e) { return safeError(e); }
}
