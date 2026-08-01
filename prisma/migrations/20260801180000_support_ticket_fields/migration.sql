-- CreateEnum
CREATE TYPE "SupportConversationStatus" AS ENUM ('OPEN', 'WAITING', 'CLOSED');

-- CreateEnum
CREATE TYPE "SupportTicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "SupportConversation" ADD COLUMN "ticketNumber" TEXT,
ADD COLUMN "subject" TEXT,
ADD COLUMN "status" "SupportConversationStatus" NOT NULL DEFAULT 'OPEN',
ADD COLUMN "priority" "SupportTicketPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN "metadata" JSONB,
ADD COLUMN "agentJoinedAt" TIMESTAMP(3),
ADD COLUMN "statusChangedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "SupportConversation_ticketNumber_key" ON "SupportConversation"("ticketNumber");

-- CreateIndex
CREATE INDEX "SupportConversation_status_lastMessageAt_idx" ON "SupportConversation"("status", "lastMessageAt");
