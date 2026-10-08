import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requestUser } from "@/lib/auth";
import { allowedConversation } from "@/lib/conversations";
import { apiError, ensureSameOrigin, throttle, safeError } from "@/lib/security";
type Context = { params: Promise<{ id: string }> };
export async function GET(req: NextRequest, context: Context) {
  const self = await requestUser(req); if (!self) return apiError("Unauthenticated", 401);
  const { id } = await context.params;
  if (!await allowedConversation(id, self.id)) return apiError("Not found", 404);
  const cursor = req.nextUrl.searchParams.get("before");
  const msgs = await db.message.findMany({ where: { conversationId: id, ...(cursor && !isNaN(new Date(cursor).getTime()) ? { createdAt: { lt: new Date(cursor) } } : {}) }, orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ messages: msgs.reverse() });
}
export async function POST(req: NextRequest, context: Context) {
  const invalid = ensureSameOrigin(req); if (invalid) return invalid;
  try {
    const self = await requestUser(req); if (!self) return apiError("Unauthenticated", 401);
    if (!await throttle(`message:${self.id}`, 35, 60)) return apiError("Slow down", 429);
    const { id } = await context.params;
    if (!await allowedConversation(id, self.id)) return apiError("Not found", 404);
    const { body } = await req.json();
    if (typeof body !== "string" || body.trim().length < 1 || body.length > 3000) return apiError("Message must contain 1–3000 characters");
    const message = await db.message.create({ data: { conversationId: id, senderId: self.id, body: body.trim() } });
    const membership = await allowedConversation(id, self.id);
    await db.conversation.update({ where: { id }, data: { updatedAt: new Date() } });
    if (membership) await db.notification.create({ data: { userId: membership.otherId, type: "MESSAGE", title: "New private message", body: "A conversation has a new message.", href: "/dashboard/messages" } });
    return NextResponse.json({ message }, { status: 201 });
  } catch (e) { return safeError(e); }
}

export async function PATCH(req: NextRequest, context: Context) {
  const invalid = ensureSameOrigin(req); if(invalid) return invalid;
  const self = await requestUser(req); if(!self) return apiError("Unauthenticated",401);
  const { id } = await context.params;
  if(!await allowedConversation(id,self.id)) return apiError("Not found",404);
  await db.message.updateMany({where:{conversationId:id,senderId:{not:self.id},readAt:null},data:{readAt:new Date()}});
  return NextResponse.json({ok:true});
}
