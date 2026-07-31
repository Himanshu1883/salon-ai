-- CreateEnum
CREATE TYPE "SalonPlan" AS ENUM ('BASIC', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "Salon" ADD COLUMN "plan" "SalonPlan" NOT NULL DEFAULT 'ENTERPRISE';
