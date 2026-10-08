import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requestUser } from "@/lib/auth";
import { apiError } from "@/lib/security";
export async function GET(req: NextRequest) {
  const user = await requestUser(req); if (!user) return apiError("Unauthenticated", 401);
  const conversations = await db.conversation.findMany({ where: { OR: [{ firstId: user.id }, { secondId: user.id }] }, include: {
    first: { select: { id: true, username: true, avatarSeed: true, status: true } },
    second: { select: { id: true, username: true, avatarSeed: true, status: true } },
    messages: { take: 1, orderBy: { createdAt: "desc" }, select: { id: true, body: true, createdAt: true, senderId: true } }
  }, orderBy: { updatedAt: "desc" } });
  const blocks = await db.block.findMany({ where: { OR: [{ blockerId: user.id }, { blockedId: user.id }] } });
  const blocked = new Set(blocks.flatMap(b => [b.blockerId, b.blockedId]));
  return NextResponse.json({ conversations: conversations.filter(c => { const other = c.firstId === user.id ? c.second : c.first; return other.status === "ACTIVE" && !blocked.has(other.id); }).map(c => ({
    id: c.id, other: c.firstId === user.id ? c.second : c.first, lastMessage: c.messages[0] || null, updatedAt: c.updatedAt
  })) });
}
