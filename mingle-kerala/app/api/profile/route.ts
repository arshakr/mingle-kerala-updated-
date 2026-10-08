import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requestUser, publicUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validation";
import { apiError, ensureSameOrigin, safeError } from "@/lib/security";
export async function PATCH(req: NextRequest) {
  const invalid = ensureSameOrigin(req); if (invalid) return invalid;
  try {
    const user = await requestUser(req); if (!user) return apiError("Unauthenticated", 401);
    const parsed = profileSchema.safeParse(await req.json()); if (!parsed.success) return apiError("Invalid profile settings");
    const { interests, ...data } = parsed.data;
    if (data.username && data.username !== user.username) {
      const last = await db.user.findUnique({ where: { id: user.id }, select: { usernameChangedAt: true } });
      if (last?.usernameChangedAt && Date.now() - last.usernameChangedAt.getTime() < 30 * 86400_000) return apiError("You may change your username once every 30 days", 429);
    }
    const updated = await db.$transaction(async tx => {
      const updated = await tx.user.update({ where: { id: user.id }, data: { ...data, ...(data.username && data.username !== user.username ? { usernameChangedAt: new Date() } : {}) } });
      if (interests) {
        await tx.userInterest.deleteMany({ where: { userId: user.id } });
        for (const name of interests) await tx.userInterest.create({ data: { user: { connect: { id: user.id } }, interest: { connectOrCreate: { where: { name }, create: { name } } } } });
      }
      return updated;
    });
    return NextResponse.json({ user: publicUser(updated) });
  } catch (e) {
    if (typeof e === "object" && e && "code" in e && e.code === "P2002") return apiError("Anonymous username already taken", 409);
    return safeError(e);
  }
}
