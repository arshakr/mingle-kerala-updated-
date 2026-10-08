import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validation";
import { activationCode, hashSecret, safeEqual, throttle, clientIp, apiError, ensureSameOrigin, safeError } from "@/lib/security";
import { createSession } from "@/lib/auth";
import { TERMS_VERSION } from "@/lib/constants";
export async function POST(req: NextRequest) {
  const invalid = ensureSameOrigin(req); if (invalid) return invalid;
  try {
    if (!await throttle(`register:${clientIp(req)}`, 5, 3600)) return apiError("Too many registration attempts", 429);
    const data = registerSchema.parse(await req.json());
    const payment = await db.payment.findUnique({ where: { id: data.paymentId } });
    if (!payment || payment.status !== "VERIFIED" || payment.userId || payment.activatedAt || payment.email !== data.email ||
        !safeEqual(payment.proofHash, hashSecret(data.proofSecret)) ||
        !safeEqual(activationCode(payment.id), data.claimCode)) return apiError("A verified, unused ₹25 activation receipt is required.", 403);
    const passwordHash = await argon2.hash(data.password, { type: argon2.argon2id });
    const user = await db.$transaction(async (tx) => {
      const created = await tx.user.create({ data: {
        email: data.email, passwordHash, username: data.username, age: data.age, gender: data.gender,
        district: data.district, locality: data.locality, language: data.language, bio: data.bio,
        avatarSeed: data.paymentId, termsVersion: TERMS_VERSION, termsAcceptedAt: new Date(),
        interests: { create: data.interests.map((name) => ({ interest: { connectOrCreate: { where: { name }, create: { name } } } })) }
      } });
      const reserved = await tx.payment.updateMany({ where: { id: data.paymentId, status: "VERIFIED", userId: null, activatedAt: null }, data: { userId: created.id, activatedAt: new Date() } });
      if (reserved.count !== 1) throw new Error("Activation already used");
      return created;
    });
    const res = NextResponse.json({ ok: true, username: user.username, userId: user.id }, { status: 201 });
    await createSession(res, user);
    return res;
  } catch (e) {
    if (e instanceof Error && e.name === "ZodError") return apiError("Check your registration information. You must be 18+ and provide all required details.");
    if (typeof e === "object" && e && "code" in e && e.code === "P2002") return apiError("That email or anonymous username is already in use.", 409);
    if (e instanceof Error && e.message === "Activation already used") return apiError("This payment has already been used.", 409);
    return safeError(e);
  }
}
