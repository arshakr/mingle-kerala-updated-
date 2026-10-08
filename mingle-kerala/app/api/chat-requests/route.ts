import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requestUser } from "@/lib/auth";
import { isBlocked } from "@/lib/conversations";
import { throttle, apiError, ensureSameOrigin, safeError } from "@/lib/security";
export async function GET(req: NextRequest) {
  const user = await requestUser(req); if (!user) return apiError("Unauthenticated", 401);
  const requests = await db.chatRequest.findMany({ where: { OR: [{ receiverId: user.id }, { senderId: user.id }] }, include: {
    sender: { select: { id: true, username: true, district: true, avatarSeed: true } },
    receiver: { select: { id: true, username: true, district: true, avatarSeed: true } }
  }, orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ requests });
}
export async function POST(req: NextRequest) {
  const invalid = ensureSameOrigin(req); if (invalid) return invalid;
  try {
    const user = await requestUser(req); if (!user) return apiError("Unauthenticated", 401);
    if (!await throttle(`request:${user.id}`, 8, 3600)) return apiError("Chat request limit reached", 429);
    const { receiverId } = await req.json();
    if (typeof receiverId !== "string" || receiverId === user.id) return apiError("Invalid recipient");
    const other = await db.user.findUnique({ where: { id: receiverId }, include: { interests: true } });
    if (!other || other.status !== "ACTIVE" || !other.discoverable || await isBlocked(user.id, receiverId)) return apiError("Recipient unavailable", 404);
    if (other.allowRequests === "NOBODY") return apiError("This user is not receiving requests", 403);
    if (other.allowRequests === "SAME_DISTRICT" && other.district !== user.district) return apiError("This user accepts same-district requests only", 403);
    if (other.allowRequests === "SHARED_INTERESTS") {
      const ownInterests = await db.userInterest.findMany({ where: { userId: user.id }, select: { interestId: true } });
      if (!ownInterests.some(x => other.interests.some(y => y.interestId === x.interestId))) return apiError("Shared interests required", 403);
    }
    const existing = await db.chatRequest.findFirst({ where: { OR: [{ senderId: user.id, receiverId }, { senderId: receiverId, receiverId: user.id }] } });
    if (existing) return apiError("A chat request already exists for this user", 409);
    const request = await db.chatRequest.create({ data: { senderId: user.id, receiverId } });
    await db.notification.create({ data: { userId: receiverId, type: "CHAT_REQUEST", title: "New conversation request", body: `${user.username} wants to connect`, href: "/dashboard/requests" } });
    return NextResponse.json({ request }, { status: 201 });
  } catch (e) { return safeError(e); }
}
