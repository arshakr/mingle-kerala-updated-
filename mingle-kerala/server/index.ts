import next from "next";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { parse as parseCookie } from "cookie";
import { findUserFromToken } from "../lib/auth";
import { db } from "../lib/db";
import { allowedConversation } from "../lib/conversations";
import { throttle } from "../lib/security";
import { presenceOnline, presenceOffline } from "../lib/presence";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT || 3000);
const nextApp = next({ dev, hostname: "0.0.0.0", port });
const handler = nextApp.getRequestHandler();

async function boot() {
  if (!dev) {
    for (const k of ["DATABASE_URL", "APP_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "ACTIVATION_CODE_SECRET", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"]) {
      if (!process.env[k]) throw new Error(`Missing required production environment variable: ${k}`);
    }
  }
  await nextApp.prepare();
  const server = createServer((req, res) => handler(req, res));
  const io = new Server(server, { path: "/socket.io", cors: { origin: process.env.APP_URL || `http://localhost:${port}`, credentials: true }, maxHttpBufferSize: 20_000 });
  const connections = new Map<string, number>();
  io.use(async (socket, nextAuth) => {
    try {
      const cookieHeader = socket.request.headers.cookie || "";
      const user = await findUserFromToken(parseCookie(cookieHeader).kc_access);
      if (!user) return nextAuth(new Error("Authentication required"));
      socket.data.userId = user.id;
      socket.data.authVersion = user.authVersion;
      nextAuth();
    } catch { nextAuth(new Error("Authentication failed")); }
  });
  io.on("connection", (socket) => {
    const userId: string = socket.data.userId;
    socket.join(`user:${userId}`);
    connections.set(userId, (connections.get(userId) || 0) + 1);
    const authCheck = setInterval(async () => {
      const user = await db.user.findUnique({ where: { id: userId }, select: { status: true, authVersion: true } }).catch(()=>null);
      if (!user || user.status !== "ACTIVE" || user.authVersion !== socket.data.authVersion) socket.disconnect(true);
    }, 30_000);
    authCheck.unref();
    void db.user.updateMany({ where: { id: userId }, data: { lastActiveAt: new Date() } }).catch(()=>{});
    void presenceOnline(userId).catch(()=>{});
    socket.on("conversation:join", async (id: unknown, ack?: (r: object) => void) => {
      if (typeof id !== "string") return ack?.({ error: "Invalid conversation" });
      const membership = await allowedConversation(id, userId);
      if (!membership) return ack?.({ error: "Not permitted" });
      socket.join(`conversation:${id}`);
      ack?.({ ok: true });
    });
    socket.on("message:send", async (payload: unknown, ack?: (r: object) => void) => {
      try {
        const p = payload as { conversationId?: unknown; body?: unknown };
        if (typeof p?.conversationId !== "string" || typeof p?.body !== "string" || !p.body.trim() || p.body.length > 3000) return ack?.({ error: "Invalid message" });
        if (!await throttle(`socket:${userId}`, 35, 60)) return ack?.({ error: "Too many messages" });
        const active = await db.user.findUnique({ where: { id: userId }, select: { status: true, authVersion: true } });
        if (active?.status !== "ACTIVE" || active.authVersion !== socket.data.authVersion) {
          socket.disconnect(true);
          return ack?.({ error: "Session no longer valid" });
        }
        const membership = await allowedConversation(p.conversationId, userId);
        if (!membership) return ack?.({ error: "Not permitted" });
        const message = await db.message.create({ data: { conversationId: p.conversationId, senderId: userId, body: p.body.trim() } });
        await db.conversation.update({ where: { id: p.conversationId }, data: { updatedAt: new Date() } });
        await db.notification.create({ data: { userId: membership.otherId, type: "MESSAGE", title: "New private message", body: "A conversation has a new message.", href: "/dashboard/messages" } });
        io.to(`user:${membership.otherId}`).emit("notification:new", { type: "MESSAGE" });
        io.to(`user:${userId}`).to(`user:${membership.otherId}`).emit("message:new", message);
        ack?.({ ok: true, message });
      } catch { ack?.({ error: "Unable to send message" }); }
    });
    socket.on("typing", async (payload: unknown) => {
      const p = payload as { conversationId?: unknown; typing?: unknown };
      if (typeof p?.conversationId !== "string" || typeof p.typing !== "boolean") return;
      const membership = await allowedConversation(p.conversationId, userId);
      if (membership) io.to(`user:${membership.otherId}`).emit("typing", { conversationId: p.conversationId, userId, typing: p.typing });
    });
    socket.on("message:read", async (conversationId: unknown) => {
      if (typeof conversationId !== "string") return;
      const membership = await allowedConversation(conversationId, userId);
      if (!membership) return;
      const readAt = new Date();
      await db.message.updateMany({ where: { conversationId, senderId: { not: userId }, readAt: null }, data: { readAt } });
      io.to(`user:${membership.otherId}`).emit("message:read", { conversationId, readAt });
    });
    socket.on("disconnect", async () => {
      clearInterval(authCheck);
      const n = Math.max(0, (connections.get(userId) || 1) - 1);
      if (n) connections.set(userId, n); else {
        connections.delete(userId);
        await presenceOffline(userId).catch(()=>{});
        await db.user.updateMany({ where: { id: userId }, data: { lastActiveAt: new Date() } }).catch(() => {});
      }
    });
  });
  const presenceHeartbeat = setInterval(() => {
    for (const userId of connections.keys()) void presenceOnline(userId).catch(()=>{});
  }, 45_000);
  presenceHeartbeat.unref();
  server.listen(port, "0.0.0.0", () => console.log(`Mingle Kerala listening on ${port}`));
}
boot().catch((error) => { console.error(error); process.exit(1); });
