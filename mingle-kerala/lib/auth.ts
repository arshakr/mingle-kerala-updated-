import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { hashSecret, randomSecret } from "@/lib/security";

const ACCESS = "kc_access";
const REFRESH = "kc_refresh";
const ttlSeconds = 15 * 60;
const refreshSeconds = 30 * 24 * 3600;
function key() {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_ACCESS_SECRET must be at least 32 characters");
  return new TextEncoder().encode(secret);
}
export async function signAccess(user: { id: string; role: string; authVersion: number }) {
  return new SignJWT({ role: user.role, version: user.authVersion }).setProtectedHeader({ alg: "HS256" }).setSubject(user.id)
    .setIssuer("kerala-connect").setAudience("kerala-connect-web")
    .setIssuedAt().setExpirationTime("15m").sign(key());
}
export async function verifyAccess(jwt: string) {
  const { payload } = await jwtVerify(jwt, key(), { issuer: "kerala-connect", audience: "kerala-connect-web" });
  return typeof payload.sub === "string" && typeof payload.version === "number" ? {id: payload.sub, version: payload.version} : null;
}
export async function findUserFromToken(jwt?: string) {
  if (!jwt) return null;
  try {
    const claim = await verifyAccess(jwt);
    if (!claim) return null;
    const user = await db.user.findUnique({ where: { id: claim.id } });
    return user?.status === "ACTIVE" && user.authVersion === claim.version ? user : null;
  } catch { return null; }
}
export async function requestUser(req: NextRequest) { return findUserFromToken(req.cookies.get(ACCESS)?.value); }
export async function serverUser() { return findUserFromToken((await cookies()).get(ACCESS)?.value); }
function setCookie(res: NextResponse, name: string, value: string, expires: number) {
  res.cookies.set(name, value, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: expires
  });
}
export async function createSession(res: NextResponse, user: { id: string; role: string; authVersion: number }) {
  const access = await signAccess(user);
  const refresh = randomSecret(48);
  await db.refreshSession.create({ data: { userId: user.id, tokenHash: hashSecret(refresh), expiresAt: new Date(Date.now() + refreshSeconds * 1000) } });
  setCookie(res, ACCESS, access, ttlSeconds);
  setCookie(res, REFRESH, refresh, refreshSeconds);
}
export function clearCookies(res: NextResponse) {
  for (const name of [ACCESS, REFRESH]) res.cookies.set(name, "", { path: "/", httpOnly: true, maxAge: 0 });
}
export async function revokeCurrentRefresh(req: NextRequest) {
  const token = req.cookies.get(REFRESH)?.value;
  if (!token) return;
  const session = await db.refreshSession.findUnique({ where: { tokenHash: hashSecret(token) } });
  if (!session || session.revokedAt) return;
  await db.$transaction([
    db.refreshSession.updateMany({ where: { userId: session.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    db.user.update({ where: { id: session.userId }, data: { authVersion: { increment: 1 } } })
  ]); // Sign-out revokes all devices to invalidate outstanding JWTs immediately.
}
export async function rotateSession(req: NextRequest, res: NextResponse) {
  const token = req.cookies.get(REFRESH)?.value;
  if (!token) return false;
  const tokenHash = hashSecret(token);
  const existing = await db.refreshSession.findUnique({ where: { tokenHash }, include: { user: true } });
  if (!existing || existing.revokedAt || existing.expiresAt < new Date() || existing.user.status !== "ACTIVE") return false;
  const next = randomSecret(48);
  const newHash = hashSecret(next);
  const updated = await db.refreshSession.updateMany({ where: { id: existing.id, revokedAt: null }, data: { revokedAt: new Date() } });
  if (updated.count !== 1) return false;
  await db.refreshSession.create({ data: { userId: existing.userId, tokenHash: newHash, expiresAt: new Date(Date.now() + refreshSeconds * 1000) } });
  setCookie(res, ACCESS, await signAccess(existing.user), ttlSeconds);
  setCookie(res, REFRESH, next, refreshSeconds);
  return true;
}
export const publicUser = (u: { id: string; username: string; role: string; district: string; locality: string; showLocality: boolean; language: string; age: number; gender: string; bio: string; avatarSeed: string; discoverable: boolean; showOnline: boolean; allowRequests: string }) => ({
  id: u.id, username: u.username, role: u.role, district: u.district, locality: u.locality, showLocality: u.showLocality, language: u.language,
  age: u.age, gender: u.gender, bio: u.bio, avatarSeed: u.avatarSeed, discoverable: u.discoverable,
  showOnline: u.showOnline, allowRequests: u.allowRequests
});
