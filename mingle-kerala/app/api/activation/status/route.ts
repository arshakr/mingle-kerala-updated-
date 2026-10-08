import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashSecret, safeEqual, activationCode, throttle, clientIp, apiError, safeError } from "@/lib/security";
export async function POST(req: NextRequest) {
  try {
    if (!await throttle(`payment-status:${clientIp(req)}`, 20, 60)) return apiError("Too many checks", 429);
    const { paymentId, proofSecret } = await req.json();
    if (typeof paymentId !== "string" || typeof proofSecret !== "string") return apiError("Invalid payment receipt");
    const payment = await db.payment.findUnique({ where: { id: paymentId } });
    if (!payment || !safeEqual(payment.proofHash, hashSecret(proofSecret))) return apiError("Receipt not found", 404);
    return NextResponse.json({ status: payment.status, verifiedAt: payment.verifiedAt, activated: Boolean(payment.activatedAt), claimCode: payment.status === "VERIFIED" && !payment.activatedAt ? activationCode(payment.id) : null });
  } catch (e) { return safeError(e); }
}
