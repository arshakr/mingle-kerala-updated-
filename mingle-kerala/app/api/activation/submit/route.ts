import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { paymentSchema } from "@/lib/validation";
import { PAYMENT_PAISE, UPI_ID } from "@/lib/constants";
import { randomSecret, hashSecret, throttle, clientIp, ensureSameOrigin, apiError, safeError, handleRateLimit } from "@/lib/security";
export async function POST(req: NextRequest) {
  const invalid = ensureSameOrigin(req); if (invalid) return invalid;
  try {
    if (!await throttle(`activation:${clientIp(req)}`, 4, 3600)) return apiError("Too many payment submissions. Try again later.", 429);
    const data = paymentSchema.parse(await req.json());
    if (await db.user.findUnique({ where: { email: data.email }, select: { id: true } })) return apiError("This email already has an account. Sign in instead.", 409);
    const proofSecret = randomSecret();
    const payment = await db.payment.create({ data: { email: data.email, amountPaise: PAYMENT_PAISE, upiId: UPI_ID, utr: data.utr.toUpperCase(), proofHash: hashSecret(proofSecret) } });
    return NextResponse.json({ paymentId: payment.id, proofSecret, status: payment.status }, { status: 201 });
  } catch (e) {
    if (typeof e === "object" && e && "code" in e && e.code === "P2002") return apiError("That transaction reference has already been submitted.", 409);
    if (e instanceof Error && e.name === "ZodError") return apiError("Please enter a valid email, UPI transaction reference and accept all required confirmations.");
    return e instanceof Error && e.message.includes("rate limiting") ? handleRateLimit(e) : safeError(e);
  }
}
