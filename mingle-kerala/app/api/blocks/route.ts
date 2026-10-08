import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requestUser } from "@/lib/auth";
import { apiError, ensureSameOrigin, safeError } from "@/lib/security";
export async function POST(req: NextRequest) {
  const invalid = ensureSameOrigin(req); if (invalid) return invalid;
  try {
    const user = await requestUser(req); if (!user) return apiError("Unauthenticated", 401);
    const { userId } = await req.json(); if (typeof userId !== "string" || userId === user.id) return apiError("Invalid user");
    await db.block.upsert({ where: { blockerId_blockedId: { blockerId: user.id, blockedId: userId } }, update: {}, create: { blockerId: user.id, blockedId: userId } });
    return NextResponse.json({ ok: true });
  } catch (e) { return safeError(e); }
}
export async function DELETE(req: NextRequest) {
  const invalid = ensureSameOrigin(req); if (invalid) return invalid;
  try {
    const user = await requestUser(req); if (!user) return apiError("Unauthenticated", 401);
    const { userId } = await req.json(); if (typeof userId !== "string") return apiError("Invalid user");
    await db.block.deleteMany({ where: { blockerId: user.id, blockedId: userId } });
    return NextResponse.json({ ok: true });
  } catch (e) { return safeError(e); }
}

export async function GET(req: NextRequest) {
  const actor = await requestUser(req); if (!actor) return apiError("Unauthenticated", 401);
  const blocked = await db.block.findMany({ where: { blockerId: actor.id }, include: { blocked: { select: { id: true, username: true, avatarSeed: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ blocked: blocked.map(x => x.blocked) });
}
