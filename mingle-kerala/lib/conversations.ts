import { db } from "@/lib/db";
export const sortedPair = (a: string, b: string) => a < b ? [a,b] as const : [b,a] as const;
export async function isBlocked(a: string, b: string) {
  return Boolean(await db.block.findFirst({ where: { OR: [{ blockerId: a, blockedId: b }, { blockerId: b, blockedId: a }] }, select: { blockerId: true } }));
}
export async function allowedConversation(conversationId: string, userId: string) {
  const conversation = await db.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation || (conversation.firstId !== userId && conversation.secondId !== userId)) return null;
  const otherId = conversation.firstId === userId ? conversation.secondId : conversation.firstId;
  if (await isBlocked(userId, otherId)) return null;
  const other = await db.user.findUnique({ where: { id: otherId }, select: { status: true } });
  if (other?.status !== "ACTIVE") return null;
  return { conversation, otherId };
}
