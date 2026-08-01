-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('SUPER_ADMIN', 'CUSTOMER_SUPPORT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "platformRole" "PlatformRole",
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Backfill existing super admins
UPDATE "User" SET "platformRole" = 'SUPER_ADMIN' WHERE "isSuperAdmin" = true;
