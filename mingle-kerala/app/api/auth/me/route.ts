import { NextRequest, NextResponse } from "next/server";
import { requestUser, publicUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError } from "@/lib/security";
export async function GET(req: NextRequest) {
  const user = await requestUser(req);
  if (!user) return apiError("Unauthenticated", 401);
  const interests = await db.userInterest.findMany({ where: { userId: user.id }, select: { interest: { select: { name: true } } } });
  return NextResponse.json({ user: { ...publicUser(user), interests: interests.map(x => x.interest.name) } });
}
