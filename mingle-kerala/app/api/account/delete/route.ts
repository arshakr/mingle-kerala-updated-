import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { requestUser, revokeCurrentRefresh, clearCookies } from "@/lib/auth";
import { apiError, ensureSameOrigin, safeError } from "@/lib/security";
export async function POST(req: NextRequest) {
  const invalid = ensureSameOrigin(req); if (invalid) return invalid;
  try {
    const actor = await requestUser(req); if (!actor) return apiError("Not signed in", 401);
    if (actor.role !== "USER") return apiError("Administrative accounts must be handled separately", 403);
    const { password, confirm } = await req.json();
    if (confirm !== "DELETE MY ACCOUNT" || typeof password !== "string") return apiError("Confirmation and password required");
    if (!await argon2.verify(actor.passwordHash, password)) return apiError("Incorrect password", 403);
    const anon = randomBytes(12).toString("hex");
    const blockedPassword = await argon2.hash(randomBytes(48).toString("base64url"), { type: argon2.argon2id });
    await db.$transaction([
      db.message.deleteMany({ where: { senderId: actor.id } }),
      db.userInterest.deleteMany({ where: { userId: actor.id } }),
      db.notification.deleteMany({ where: { userId: actor.id } }),
      db.refreshSession.deleteMany({ where: { userId: actor.id } }),
      db.chatRequest.deleteMany({ where: { OR: [{ senderId: actor.id }, { receiverId: actor.id }] } }),
      db.user.update({ where: { id: actor.id }, data: {
        email: `removed_${anon}@invalid.example`, username: `Removed_${anon}`,
        passwordHash: blockedPassword, avatarSeed: anon, bio: "", status: "DELETED", age: 18,
        discoverable: false, showOnline: false, allowRequests: "NOBODY"
      } })
    ]);
    // Anonymized moderation and transaction records may be retained for necessary operations.
    const res = NextResponse.json({ ok: true }); clearCookies(res); return res;
  } catch (e) { return safeError(e); }
}
