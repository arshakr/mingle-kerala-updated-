import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export function randomSecret(bytes = 32) { return randomBytes(bytes).toString("base64url"); }
export function hashSecret(value: string) { return createHash("sha256").update(value).digest("hex"); }
export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
export function activationCode(id: string) {
  const secret = process.env.ACTIVATION_CODE_SECRET;
  if (!secret) throw new Error("ACTIVATION_CODE_SECRET is required");
  return "KC-" + createHmac("sha256", secret).update(id).digest("hex").slice(0, 20).toUpperCase();
}

const inMemory = new Map<string, { count: number; expires: number }>();
let redis: Redis | null = null;
function getRedis() {
  if (redis) return redis;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
  }
  return redis;
}
export async function throttle(key: string, max = 10, windowSec = 60) {
  const store = getRedis();
  if (store) {
    const bucket = Math.floor(Date.now() / (windowSec * 1000));
    const k = `kc:rl:${key}:${bucket}`;
    const n = await store.incr(k);
    if (n === 1) await store.expire(k, windowSec + 10);
    return n <= max;
  }
  // Only suitable for single-process local development; production requires Redis.
  if (process.env.NODE_ENV === "production") throw new Error("UPSTASH_REDIS_REST_URL/TOKEN are required for production rate limiting");
  const now = Date.now();
  const cur = inMemory.get(key);
  if (!cur || cur.expires <= now) { inMemory.set(key, { count: 1, expires: now + windowSec * 1000 }); return true; }
  cur.count++;
  return cur.count <= max;
}
export function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients still need authentication
  try { return new URL(origin).origin === new URL(process.env.APP_URL || req.nextUrl.origin).origin; }
  catch { return false; }
}
export function apiError(message: string, status = 400) { return NextResponse.json({ error: message }, { status }); }
export function safeError(e: unknown) {
  if (e instanceof Error && e.message.startsWith("VALIDATION:")) return apiError(e.message.slice(11), 400);
  console.error("Request failed", e instanceof Error ? e.message : "unknown");
  return apiError("Unable to complete your request.", 500);
}
export function ensureSameOrigin(req: NextRequest) { return sameOrigin(req) ? null : apiError("Invalid request origin", 403); }
export function handleRateLimit(e: unknown) { console.error("Rate limit unavailable", e); return apiError("Service temporarily unavailable.", 503); }
