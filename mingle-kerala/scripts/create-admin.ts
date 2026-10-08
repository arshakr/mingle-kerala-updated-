import "dotenv/config";
import argon2 from "argon2";
import { db } from "../lib/db";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { randomBytes } from "node:crypto";
import { TERMS_VERSION } from "../lib/constants";
async function main() {
  const rl = createInterface({ input: stdin, output: stdout });
  const email = (await rl.question("Admin email: ")).trim().toLowerCase();
  const password = await rl.question("Admin password (min 14 characters): ");
  rl.close();
  if (!email.includes("@") || password.length < 14) throw new Error("Valid email and a password of 14+ characters required");
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) throw new Error("This email already exists. No existing user was promoted.");
  const username = `KCAdmin_${randomBytes(5).toString("hex")}`;
  await db.user.create({ data: { email, username, passwordHash: await argon2.hash(password), age: 18, gender: "PREFER_NOT_TO_SAY", district: "Ernakulam", language: "BOTH", avatarSeed: username, role: "SUPER_ADMIN", termsVersion: TERMS_VERSION, termsAcceptedAt: new Date(), discoverable: false, allowRequests: "NOBODY" } });
  console.log("Super admin created. Use the sign-in page.");
}
main().catch(e => { console.error(e.message); process.exitCode = 1; }).finally(() => db.$disconnect());
