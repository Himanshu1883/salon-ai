-- Service catalog extensions: audience, types, packages, add-ons

CREATE TYPE "ServiceCatalogType" AS ENUM ('SERVICE', 'PACKAGE', 'ADD_ON');
CREATE TYPE "ServiceAudience" AS ENUM ('MEN', 'WOMEN', 'UNISEX', 'KIDS');
CREATE TYPE "ServiceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE "PackagePricingStrategy" AS ENUM ('STANDARD_TOTAL', 'CUSTOM_PRICE', 'PERCENTAGE_DISCOUNT', 'FIXED_DISCOUNT');
CREATE TYPE "ServiceCategoryGroup" AS ENUM ('SERVICES', 'PACKAGES', 'ADDONS');

ALTER TABLE "ServiceCategory" ADD COLUMN "categoryGroup" "ServiceCategoryGroup" NOT NULL DEFAULT 'SERVICES';

DROP INDEX IF EXISTS "ServiceCategory_salonId_sortOrder_idx";
CREATE INDEX "ServiceCategory_salonId_categoryGroup_sortOrder_idx" ON "ServiceCategory"("salonId", "categoryGroup", "sortOrder");

ALTER TABLE "Service" ADD COLUMN "catalogType" "ServiceCatalogType" NOT NULL DEFAULT 'SERVICE';
ALTER TABLE "Service" ADD COLUMN "audience" "ServiceAudience" NOT NULL DEFAULT 'UNISEX';
ALTER TABLE "Service" ADD COLUMN "status" "ServiceStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Service" ADD COLUMN "onlineBooking" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Service" ADD COLUMN "inStoreBooking" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Service" ADD COLUMN "pricingStrategy" "PackagePricingStrategy";
ALTER TABLE "Service" ADD COLUMN "discountPercent" DOUBLE PRECISION;
ALTER TABLE "Service" ADD COLUMN "discountAmount" DOUBLE PRECISION;

CREATE INDEX "Service_salonId_catalogType_status_idx" ON "Service"("salonId", "catalogType", "status");
CREATE INDEX "Service_salonId_audience_idx" ON "Service"("salonId", "audience");

CREATE TABLE "ServicePackageItem" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "includedServiceId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ServicePackageItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ServiceAddOnLink" (
    "id" TEXT NOT NULL,
    "parentServiceId" TEXT NOT NULL,
    "addOnServiceId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ServiceAddOnLink_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ServicePackageItem_packageId_includedServiceId_key" ON "ServicePackageItem"("packageId", "includedServiceId");
CREATE INDEX "ServicePackageItem_packageId_idx" ON "ServicePackageItem"("packageId");
CREATE INDEX "ServicePackageItem_includedServiceId_idx" ON "ServicePackageItem"("includedServiceId");

CREATE UNIQUE INDEX "ServiceAddOnLink_parentServiceId_addOnServiceId_key" ON "ServiceAddOnLink"("parentServiceId", "addOnServiceId");
CREATE INDEX "ServiceAddOnLink_parentServiceId_idx" ON "ServiceAddOnLink"("parentServiceId");
CREATE INDEX "ServiceAddOnLink_addOnServiceId_idx" ON "ServiceAddOnLink"("addOnServiceId");

ALTER TABLE "ServicePackageItem" ADD CONSTRAINT "ServicePackageItem_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ServicePackageItem" ADD CONSTRAINT "ServicePackageItem_includedServiceId_fkey" FOREIGN KEY ("includedServiceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ServiceAddOnLink" ADD CONSTRAINT "ServiceAddOnLink_parentServiceId_fkey" FOREIGN KEY ("parentServiceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ServiceAddOnLink" ADD CONSTRAINT "ServiceAddOnLink_addOnServiceId_fkey" FOREIGN KEY ("addOnServiceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
