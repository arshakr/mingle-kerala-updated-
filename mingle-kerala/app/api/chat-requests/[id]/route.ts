import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requestUser } from "@/lib/auth";
import { isBlocked, sortedPair } from "@/lib/conversations";
import { apiError, ensureSameOrigin, safeError } from "@/lib/security";
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const invalid = ensureSameOrigin(req); if (invalid) return invalid;
  try {
    const self = await requestUser(req); if (!self) return apiError("Unauthenticated", 401);
    const { id } = await context.params;
    const { action } = await req.json();
    if (action !== "ACCEPT" && action !== "DECLINE") return apiError("Invalid action");
    const request = await db.chatRequest.findUnique({ where: { id } });
    if (!request || request.receiverId !== self.id || request.status !== "PENDING") return apiError("Request not available", 404);
    if (await isBlocked(request.senderId, request.receiverId)) return apiError("Not permitted", 403);
    const [firstId, secondId] = sortedPair(request.senderId, request.receiverId);
    const result = await db.$transaction(async tx => {
      const updated = await tx.chatRequest.updateMany({ where: { id, status: "PENDING", receiverId: self.id }, data: { status: action === "ACCEPT" ? "ACCEPTED" : "DECLINED" } });
      if (!updated.count) throw new Error("Request already handled");
      const conversation = action === "ACCEPT" ? await tx.conversation.upsert({ where: { firstId_secondId: { firstId, secondId } }, create: { firstId, secondId }, update: {} }) : null;
      await tx.notification.create({ data: { userId: request.senderId, type: "CHAT_REQUEST_REPLY", title: action === "ACCEPT" ? "Request accepted" : "Request declined", body: action === "ACCEPT" ? `${self.username} accepted your request` : "Your request was declined", href: action === "ACCEPT" ? "/dashboard/messages" : "/dashboard/requests" } });
      return conversation;
    });
    return NextResponse.json({ ok: true, conversation: result });
  } catch (e) { return safeError(e); }
}
