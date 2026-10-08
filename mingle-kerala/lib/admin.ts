import { NextRequest } from "next/server";
import { requestUser } from "@/lib/auth";
export async function adminFromRequest(req: NextRequest) {
  const actor = await requestUser(req);
  return actor && ["MODERATOR", "ADMIN", "SUPER_ADMIN"].includes(actor.role) ? actor : null;
}
export async function canManageUsers(req: NextRequest) {
  const actor = await adminFromRequest(req);
  return actor && ["ADMIN", "SUPER_ADMIN"].includes(actor.role) ? actor : null;
}
