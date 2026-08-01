-- CreateTable
CREATE TABLE "AdminImpersonationToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminImpersonationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformAdminAuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "salonId" TEXT,
    "targetUserId" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformAdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminImpersonationToken_tokenHash_key" ON "AdminImpersonationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminImpersonationToken_salonId_idx" ON "AdminImpersonationToken"("salonId");

-- CreateIndex
CREATE INDEX "AdminImpersonationToken_adminUserId_idx" ON "AdminImpersonationToken"("adminUserId");

-- CreateIndex
CREATE INDEX "PlatformAdminAuditLog_adminUserId_idx" ON "PlatformAdminAuditLog"("adminUserId");

-- CreateIndex
CREATE INDEX "PlatformAdminAuditLog_salonId_idx" ON "PlatformAdminAuditLog"("salonId");

-- CreateIndex
CREATE INDEX "PlatformAdminAuditLog_createdAt_idx" ON "PlatformAdminAuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "AdminImpersonationToken" ADD CONSTRAINT "AdminImpersonationToken_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
