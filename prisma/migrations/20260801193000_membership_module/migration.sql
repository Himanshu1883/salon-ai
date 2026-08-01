-- CreateEnum
CREATE TYPE "MembershipPlanType" AS ENUM ('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "MembershipPlanStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MembershipBenefitType" AS ENUM ('DISCOUNT_PERCENT', 'DISCOUNT_FIXED', 'FREE_SERVICE', 'PRIORITY_BOOKING', 'WALLET_BONUS', 'LOYALTY_MULTIPLIER', 'OTHER');

-- CreateEnum
CREATE TYPE "CustomerMembershipStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED', 'PENDING');

-- CreateEnum
CREATE TYPE "MembershipTransactionType" AS ENUM ('PURCHASE', 'RENEWAL', 'UPGRADE', 'REFUND', 'WALLET_TOPUP', 'WALLET_DEBIT', 'LOYALTY_EARN', 'LOYALTY_REDEEM');

-- CreateEnum
CREATE TYPE "GiftCardStatus" AS ENUM ('ACTIVE', 'REDEEMED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "MembershipPlan" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Standard',
    "type" "MembershipPlanType" NOT NULL DEFAULT 'MONTHLY',
    "validityDays" INTEGER NOT NULL DEFAULT 30,
    "price" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "walletBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rewardMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "priorityBooking" BOOLEAN NOT NULL DEFAULT false,
    "vipAccess" BOOLEAN NOT NULL DEFAULT false,
    "themeColor" TEXT NOT NULL DEFAULT '#22C55E',
    "bannerUrl" TEXT,
    "badgeUrl" TEXT,
    "status" "MembershipPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipBenefit" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "MembershipBenefitType" NOT NULL DEFAULT 'OTHER',
    "value" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipBenefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanBenefit" (
    "planId" TEXT NOT NULL,
    "benefitId" TEXT NOT NULL,
    "valueOverride" DOUBLE PRECISION,

    CONSTRAINT "PlanBenefit_pkey" PRIMARY KEY ("planId","benefitId")
);

-- CreateTable
CREATE TABLE "CustomerMembership" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "CustomerMembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "pricePaid" DOUBLE PRECISION NOT NULL,
    "taxPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountApplied" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "membershipNumber" TEXT NOT NULL,
    "qrCode" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipTransaction" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "customerMembershipId" TEXT,
    "customerId" TEXT NOT NULL,
    "type" "MembershipTransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "paymentMethod" TEXT,
    "invoiceId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembershipTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltySettings" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "pointsPerRupee" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "redemptionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.01,
    "minRedemptionPoints" INTEGER NOT NULL DEFAULT 100,
    "expiryDays" INTEGER,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyPointsLedger" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoyaltyPointsLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletAccount" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "walletAccountId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipOffer" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "planId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discountPercent" DOUBLE PRECISION,
    "discountFixed" DOUBLE PRECISION,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftCard" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "initialBalance" DOUBLE PRECISION NOT NULL,
    "currentBalance" DOUBLE PRECISION NOT NULL,
    "purchaserName" TEXT,
    "recipientName" TEXT,
    "recipientEmail" TEXT,
    "status" "GiftCardStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "redeemedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyMembershipMember" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "customerMembershipId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL DEFAULT 'family',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyMembershipMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipUsageLog" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "customerMembershipId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "serviceId" TEXT,
    "description" TEXT NOT NULL,
    "discountApplied" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "invoiceId" TEXT,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembershipUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipSettings" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "autoRenewEnabled" BOOLEAN NOT NULL DEFAULT true,
    "renewalReminderDays" INTEGER NOT NULL DEFAULT 7,
    "allowFamilyMembers" BOOLEAN NOT NULL DEFAULT false,
    "maxFamilyMembers" INTEGER NOT NULL DEFAULT 4,
    "defaultTaxRate" DOUBLE PRECISION NOT NULL DEFAULT 18,
    "membershipPrefix" TEXT NOT NULL DEFAULT 'GD',
    "termsAndConditions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MembershipPlan_salonId_status_idx" ON "MembershipPlan"("salonId", "status");

-- CreateIndex
CREATE INDEX "MembershipPlan_salonId_sortOrder_idx" ON "MembershipPlan"("salonId", "sortOrder");

-- CreateIndex
CREATE INDEX "MembershipBenefit_salonId_idx" ON "MembershipBenefit"("salonId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerMembership_salonId_membershipNumber_key" ON "CustomerMembership"("salonId", "membershipNumber");

-- CreateIndex
CREATE INDEX "CustomerMembership_salonId_customerId_idx" ON "CustomerMembership"("salonId", "customerId");

-- CreateIndex
CREATE INDEX "CustomerMembership_salonId_status_idx" ON "CustomerMembership"("salonId", "status");

-- CreateIndex
CREATE INDEX "CustomerMembership_salonId_endDate_idx" ON "CustomerMembership"("salonId", "endDate");

-- CreateIndex
CREATE INDEX "MembershipTransaction_salonId_customerId_idx" ON "MembershipTransaction"("salonId", "customerId");

-- CreateIndex
CREATE INDEX "MembershipTransaction_salonId_createdAt_idx" ON "MembershipTransaction"("salonId", "createdAt");

-- CreateIndex
CREATE INDEX "MembershipTransaction_customerMembershipId_idx" ON "MembershipTransaction"("customerMembershipId");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltySettings_salonId_key" ON "LoyaltySettings"("salonId");

-- CreateIndex
CREATE INDEX "LoyaltyPointsLedger_salonId_customerId_idx" ON "LoyaltyPointsLedger"("salonId", "customerId");

-- CreateIndex
CREATE INDEX "LoyaltyPointsLedger_salonId_createdAt_idx" ON "LoyaltyPointsLedger"("salonId", "createdAt");

-- CreateIndex
CREATE INDEX "WalletAccount_salonId_idx" ON "WalletAccount"("salonId");

-- CreateIndex
CREATE UNIQUE INDEX "WalletAccount_salonId_customerId_key" ON "WalletAccount"("salonId", "customerId");

-- CreateIndex
CREATE INDEX "WalletTransaction_salonId_customerId_idx" ON "WalletTransaction"("salonId", "customerId");

-- CreateIndex
CREATE INDEX "WalletTransaction_walletAccountId_createdAt_idx" ON "WalletTransaction"("walletAccountId", "createdAt");

-- CreateIndex
CREATE INDEX "MembershipOffer_salonId_status_idx" ON "MembershipOffer"("salonId", "status");

-- CreateIndex
CREATE INDEX "MembershipOffer_salonId_validFrom_validTo_idx" ON "MembershipOffer"("salonId", "validFrom", "validTo");

-- CreateIndex
CREATE INDEX "GiftCard_salonId_status_idx" ON "GiftCard"("salonId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_salonId_code_key" ON "GiftCard"("salonId", "code");

-- CreateIndex
CREATE INDEX "FamilyMembershipMember_customerMembershipId_idx" ON "FamilyMembershipMember"("customerMembershipId");

-- CreateIndex
CREATE INDEX "FamilyMembershipMember_salonId_customerId_idx" ON "FamilyMembershipMember"("salonId", "customerId");

-- CreateIndex
CREATE INDEX "MembershipUsageLog_salonId_customerId_idx" ON "MembershipUsageLog"("salonId", "customerId");

-- CreateIndex
CREATE INDEX "MembershipUsageLog_customerMembershipId_usedAt_idx" ON "MembershipUsageLog"("customerMembershipId", "usedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MembershipSettings_salonId_key" ON "MembershipSettings"("salonId");

-- AddForeignKey
ALTER TABLE "MembershipPlan" ADD CONSTRAINT "MembershipPlan_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipBenefit" ADD CONSTRAINT "MembershipBenefit_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanBenefit" ADD CONSTRAINT "PlanBenefit_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MembershipPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanBenefit" ADD CONSTRAINT "PlanBenefit_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "MembershipBenefit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerMembership" ADD CONSTRAINT "CustomerMembership_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerMembership" ADD CONSTRAINT "CustomerMembership_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerMembership" ADD CONSTRAINT "CustomerMembership_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MembershipPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipTransaction" ADD CONSTRAINT "MembershipTransaction_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipTransaction" ADD CONSTRAINT "MembershipTransaction_customerMembershipId_fkey" FOREIGN KEY ("customerMembershipId") REFERENCES "CustomerMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipTransaction" ADD CONSTRAINT "MembershipTransaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltySettings" ADD CONSTRAINT "LoyaltySettings_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyPointsLedger" ADD CONSTRAINT "LoyaltyPointsLedger_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyPointsLedger" ADD CONSTRAINT "LoyaltyPointsLedger_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletAccount" ADD CONSTRAINT "WalletAccount_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletAccount" ADD CONSTRAINT "WalletAccount_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletAccountId_fkey" FOREIGN KEY ("walletAccountId") REFERENCES "WalletAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipOffer" ADD CONSTRAINT "MembershipOffer_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipOffer" ADD CONSTRAINT "MembershipOffer_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MembershipPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMembershipMember" ADD CONSTRAINT "FamilyMembershipMember_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMembershipMember" ADD CONSTRAINT "FamilyMembershipMember_customerMembershipId_fkey" FOREIGN KEY ("customerMembershipId") REFERENCES "CustomerMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMembershipMember" ADD CONSTRAINT "FamilyMembershipMember_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipUsageLog" ADD CONSTRAINT "MembershipUsageLog_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipUsageLog" ADD CONSTRAINT "MembershipUsageLog_customerMembershipId_fkey" FOREIGN KEY ("customerMembershipId") REFERENCES "CustomerMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipUsageLog" ADD CONSTRAINT "MembershipUsageLog_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipSettings" ADD CONSTRAINT "MembershipSettings_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
