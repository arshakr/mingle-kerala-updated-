import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requestUser } from "@/lib/auth";
import { apiError } from "@/lib/security";
import { DISTRICTS } from "@/lib/constants";
import { onlineIds } from "@/lib/presence";
export async function GET(req: NextRequest) {
  const self = await requestUser(req); if (!self) return apiError("Unauthenticated", 401);
  const district = req.nextUrl.searchParams.get("district");
  const place = req.nextUrl.searchParams.get("place")?.trim().slice(0, 80);
  const language = req.nextUrl.searchParams.get("language");
  const interest = req.nextUrl.searchParams.get("interest");
  const blocks = await db.block.findMany({ where: { OR: [{ blockerId: self.id }, { blockedId: self.id }] }, select: { blockerId: true, blockedId: true } });
  const excluded = [self.id, ...blocks.map(b => b.blockerId === self.id ? b.blockedId : b.blockerId)];
  const own = await db.userInterest.findMany({ where: { userId: self.id }, select: { interest: { select: { name: true } } } });
  const ownInterests = new Set(own.map(x => x.interest.name));
  const users = await db.user.findMany({ where: {
    id: { notIn: excluded }, status: "ACTIVE", discoverable: true,
    ...(district && DISTRICTS.includes(district as typeof DISTRICTS[number]) ? { district } : {}),
    ...(place ? { showLocality: true, locality: { contains: place, mode: "insensitive" as const } } : {}),
    ...(language && ["MALAYALAM", "ENGLISH", "BOTH"].includes(language) ? { language: language as "MALAYALAM" | "ENGLISH" | "BOTH" } : {}),
    ...(interest ? { interests: { some: { interest: { name: interest } } } } : {})
  }, select: {
    id: true, username: true, district: true, locality: true, showLocality: true, age: true, gender: true, language: true,
    bio: true, avatarSeed: true, showOnline: true, lastActiveAt: true, allowRequests: true,
    interests: { select: { interest: { select: { name: true } } } }
  }, take: 100, orderBy: { lastActiveAt: "desc" } });
  const now = Date.now();
  const online = await onlineIds(users.filter(u=>u.showOnline).map(u=>u.id));
  return NextResponse.json({ users: users.map(u => {
    const interests = u.interests.map(x => x.interest.name);
    const shared = interests.filter(x => ownInterests.has(x));
    const canRequest = u.allowRequests !== "NOBODY" &&
      (u.allowRequests !== "SAME_DISTRICT" || u.district === self.district) &&
      (u.allowRequests !== "SHARED_INTERESTS" || shared.length > 0);
    return {
      id: u.id, username: u.username, district: u.district, locality: u.showLocality ? u.locality : null, age: u.age, gender: u.gender,
      language: u.language, bio: u.bio, avatarSeed: u.avatarSeed, interests, shared,
      online: u.showOnline && online.has(u.id),
      recentlyActive: u.showOnline && now - u.lastActiveAt.getTime() < 15 * 60_000,
      canRequest, score: shared.length * 4 + (u.district === self.district ? 3 : 0) + (u.language === self.language || u.language === "BOTH" ? 2 : 0)
    };
  }).sort((a,b) => b.score - a.score) });
}
