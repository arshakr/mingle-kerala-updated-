import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

if (typeof window === "undefined" && ws) {
  neonConfig.webSocketConstructor = ws;
}

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return new PrismaClient();
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

const globalPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalPrisma.prisma = db;
