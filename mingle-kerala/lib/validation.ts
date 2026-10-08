import { z } from "zod";
import { DISTRICTS, INTERESTS } from "@/lib/constants";
export const emailSchema = z.string().trim().toLowerCase().email().max(254);
export const passwordSchema = z.string().min(10).max(128);
export const paymentSchema = z.object({
  email: emailSchema, utr: z.string().trim().regex(/^[A-Za-z0-9]{8,35}$/, "Enter a valid UPI transaction reference"),
  isAdult: z.literal(true), acceptTerms: z.literal(true), acceptPrivacy: z.literal(true), acceptGuidelines: z.literal(true)
});
export const localitySchema = z.string().trim().max(80).regex(/^[\p{L}\p{M}\p{N} .'-]*$/u, "Enter a valid Kerala place name");
export const registerSchema = z.object({
  paymentId: z.string().min(5), proofSecret: z.string().min(30), claimCode: z.string().min(8),
  email: emailSchema, password: passwordSchema,
  username: z.string().trim().regex(/^[A-Za-z][A-Za-z0-9_]{4,23}$/, "Use 5–24 letters, digits or underscores"),
  age: z.number().int().min(18).max(115),
  gender: z.enum(["MALE", "FEMALE", "PREFER_NOT_TO_SAY"]),
  district: z.enum(DISTRICTS), locality: localitySchema.default(""), language: z.enum(["MALAYALAM", "ENGLISH", "BOTH"]),
  bio: z.string().trim().max(280).default(""),
  interests: z.array(z.enum(INTERESTS)).min(1).max(8),
  isAdult: z.literal(true), acceptTerms: z.literal(true), acceptPrivacy: z.literal(true), acceptGuidelines: z.literal(true)
});
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1) });
export const profileSchema = z.object({
  bio: z.string().trim().max(280).optional(),
  username: z.string().trim().regex(/^[A-Za-z][A-Za-z0-9_]{4,23}$/).optional(),
  gender: z.enum(["MALE", "FEMALE", "PREFER_NOT_TO_SAY"]).optional(),
  avatarSeed: z.string().regex(/^[a-zA-Z0-9_-]{8,64}$/).optional(),
  district: z.enum(DISTRICTS).optional(),
  locality: localitySchema.optional(), showLocality: z.boolean().optional(),
  language: z.enum(["MALAYALAM", "ENGLISH", "BOTH"]).optional(),
  discoverable: z.boolean().optional(), showOnline: z.boolean().optional(),
  allowRequests: z.enum(["EVERYONE", "SAME_DISTRICT", "SHARED_INTERESTS", "NOBODY"]).optional(),
  interests: z.array(z.enum(INTERESTS)).min(1).max(8).optional()
});
