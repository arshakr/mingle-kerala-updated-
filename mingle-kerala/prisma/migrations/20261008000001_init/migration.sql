-- Mingle Kerala v1 initial schema (PostgreSQL)
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'PREFER_NOT_TO_SAY');
CREATE TYPE "Language" AS ENUM ('MALAYALAM', 'ENGLISH', 'BOTH');
CREATE TYPE "Role" AS ENUM ('USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED', 'DELETED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'REFUNDED');
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'DISMISSED', 'ACTIONED');

CREATE TABLE "User" (
 "id" TEXT NOT NULL,"email" TEXT NOT NULL,"passwordHash" TEXT NOT NULL,"username" TEXT NOT NULL,
 "role" "Role" NOT NULL DEFAULT 'USER',"status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',"authVersion" INTEGER NOT NULL DEFAULT 0,
 "age" INTEGER NOT NULL,"gender" "Gender" NOT NULL,"district" TEXT NOT NULL,"language" "Language" NOT NULL,
 "bio" TEXT NOT NULL DEFAULT '',"avatarSeed" TEXT NOT NULL,"usernameChangedAt" TIMESTAMP(3),
 "discoverable" BOOLEAN NOT NULL DEFAULT true,"showOnline" BOOLEAN NOT NULL DEFAULT true,
 "allowRequests" TEXT NOT NULL DEFAULT 'EVERYONE',
 "termsVersion" TEXT NOT NULL,"termsAcceptedAt" TIMESTAMP(3) NOT NULL,
 "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE INDEX "User_district_discoverable_status_idx" ON "User"("district","discoverable","status");
CREATE INDEX "User_lastActiveAt_idx" ON "User"("lastActiveAt");
CREATE TABLE "Interest" ("id" TEXT NOT NULL,"name" TEXT NOT NULL,CONSTRAINT "Interest_pkey" PRIMARY KEY("id"));
CREATE UNIQUE INDEX "Interest_name_key" ON "Interest"("name");
CREATE TABLE "UserInterest" (
 "userId" TEXT NOT NULL,"interestId" TEXT NOT NULL,
 CONSTRAINT "UserInterest_pkey" PRIMARY KEY("userId","interestId")
);
CREATE TABLE "Payment" (
 "id" TEXT NOT NULL,"email" TEXT NOT NULL,"amountPaise" INTEGER NOT NULL DEFAULT 2500,
 "upiId" TEXT NOT NULL,"utr" TEXT NOT NULL,"proofHash" TEXT NOT NULL,
 "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
 "verifiedAt" TIMESTAMP(3),"verifiedBy" TEXT,"activatedAt" TIMESTAMP(3),"userId" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Payment_utr_key" ON "Payment"("utr");
CREATE UNIQUE INDEX "Payment_userId_key" ON "Payment"("userId");
CREATE INDEX "Payment_email_status_idx" ON "Payment"("email","status");
CREATE TABLE "RefreshSession" (
 "id" TEXT NOT NULL,"tokenHash" TEXT NOT NULL,"userId" TEXT NOT NULL,
 "expiresAt" TIMESTAMP(3) NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "revokedAt" TIMESTAMP(3),CONSTRAINT "RefreshSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RefreshSession_tokenHash_key" ON "RefreshSession"("tokenHash");
CREATE INDEX "RefreshSession_userId_idx" ON "RefreshSession"("userId");
CREATE TABLE "ChatRequest" (
 "id" TEXT NOT NULL,"senderId" TEXT NOT NULL,"receiverId" TEXT NOT NULL,
 "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "ChatRequest_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ChatRequest_senderId_receiverId_key" ON "ChatRequest"("senderId","receiverId");
CREATE INDEX "ChatRequest_receiverId_status_idx" ON "ChatRequest"("receiverId","status");
CREATE TABLE "Conversation" (
 "id" TEXT NOT NULL,"firstId" TEXT NOT NULL,"secondId" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Conversation_firstId_secondId_key" ON "Conversation"("firstId","secondId");
CREATE INDEX "Conversation_secondId_idx" ON "Conversation"("secondId");
CREATE TABLE "Message" (
 "id" TEXT NOT NULL,"conversationId" TEXT NOT NULL,"senderId" TEXT NOT NULL,
 "body" VARCHAR(3000) NOT NULL,"readAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "Message_pkey" PRIMARY KEY("id")
);
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId","createdAt");
CREATE TABLE "Block" (
 "blockerId" TEXT NOT NULL,"blockedId" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "Block_pkey" PRIMARY KEY("blockerId","blockedId")
);
CREATE TABLE "Report" (
 "id" TEXT NOT NULL,"reporterId" TEXT NOT NULL,"reportedId" TEXT NOT NULL,
 "reason" TEXT NOT NULL,"details" VARCHAR(1000) NOT NULL DEFAULT '',
 "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "Report_pkey" PRIMARY KEY("id")
);
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status","createdAt");
CREATE TABLE "Notification" (
 "id" TEXT NOT NULL,"userId" TEXT NOT NULL,"type" TEXT NOT NULL,"title" TEXT NOT NULL,
 "body" TEXT NOT NULL,"href" TEXT,"readAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "Notification_pkey" PRIMARY KEY("id")
);
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId","readAt","createdAt");
CREATE TABLE "ModerationAction" (
 "id" TEXT NOT NULL,"moderatorId" TEXT NOT NULL,"targetId" TEXT NOT NULL,
 "action" TEXT NOT NULL,"reason" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "ModerationAction_pkey" PRIMARY KEY("id")
);

ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "Interest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RefreshSession" ADD CONSTRAINT "RefreshSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatRequest" ADD CONSTRAINT "ChatRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatRequest" ADD CONSTRAINT "ChatRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_firstId_fkey" FOREIGN KEY ("firstId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_secondId_fkey" FOREIGN KEY ("secondId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedId_fkey" FOREIGN KEY ("reportedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
