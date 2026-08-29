-- Idempotent service catalog schema (safe to re-run on production)

DO $$ BEGIN
  CREATE TYPE "ServiceCatalogType" AS ENUM ('SERVICE', 'PACKAGE', 'ADD_ON');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ServiceAudience" AS ENUM ('MEN', 'WOMEN', 'UNISEX', 'KIDS');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ServiceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PackagePricingStrategy" AS ENUM ('STANDARD_TOTAL', 'CUSTOM_PRICE', 'PERCENTAGE_DISCOUNT', 'FIXED_DISCOUNT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ServiceCategoryGroup" AS ENUM ('SERVICES', 'PACKAGES', 'ADDONS');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "ServiceCategory" ADD COLUMN IF NOT EXISTS "categoryGroup" "ServiceCategoryGroup" NOT NULL DEFAULT 'SERVICES';

DROP INDEX IF EXISTS "ServiceCategory_salonId_sortOrder_idx";
CREATE INDEX IF NOT EXISTS "ServiceCategory_salonId_categoryGroup_sortOrder_idx" ON "ServiceCategory"("salonId", "categoryGroup", "sortOrder");

ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "catalogType" "ServiceCatalogType" NOT NULL DEFAULT 'SERVICE';
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "audience" "ServiceAudience" NOT NULL DEFAULT 'UNISEX';
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "status" "ServiceStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "onlineBooking" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "inStoreBooking" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "pricingStrategy" "PackagePricingStrategy";
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "discountPercent" DOUBLE PRECISION;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "discountAmount" DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS "Service_salonId_catalogType_status_idx" ON "Service"("salonId", "catalogType", "status");
CREATE INDEX IF NOT EXISTS "Service_salonId_audience_idx" ON "Service"("salonId", "audience");

CREATE TABLE IF NOT EXISTS "ServicePackageItem" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "includedServiceId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "ServicePackageItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ServiceAddOnLink" (
    "id" TEXT NOT NULL,
    "parentServiceId" TEXT NOT NULL,
    "addOnServiceId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ServiceAddOnLink_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ServicePackageItem_packageId_includedServiceId_key" ON "ServicePackageItem"("packageId", "includedServiceId");
CREATE INDEX IF NOT EXISTS "ServicePackageItem_packageId_idx" ON "ServicePackageItem"("packageId");
CREATE INDEX IF NOT EXISTS "ServicePackageItem_includedServiceId_idx" ON "ServicePackageItem"("includedServiceId");

CREATE UNIQUE INDEX IF NOT EXISTS "ServiceAddOnLink_parentServiceId_addOnServiceId_key" ON "ServiceAddOnLink"("parentServiceId", "addOnServiceId");
CREATE INDEX IF NOT EXISTS "ServiceAddOnLink_parentServiceId_idx" ON "ServiceAddOnLink"("parentServiceId");
CREATE INDEX IF NOT EXISTS "ServiceAddOnLink_addOnServiceId_idx" ON "ServiceAddOnLink"("addOnServiceId");

DO $$ BEGIN
  ALTER TABLE "ServicePackageItem" ADD CONSTRAINT "ServicePackageItem_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ServicePackageItem" ADD CONSTRAINT "ServicePackageItem_includedServiceId_fkey" FOREIGN KEY ("includedServiceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ServiceAddOnLink" ADD CONSTRAINT "ServiceAddOnLink_parentServiceId_fkey" FOREIGN KEY ("parentServiceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ServiceAddOnLink" ADD CONSTRAINT "ServiceAddOnLink_addOnServiceId_fkey" FOREIGN KEY ("addOnServiceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Service menu importer extensions
DO $$ BEGIN
  ALTER TYPE "ServiceAudience" ADD VALUE 'COUPLES';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "isStartingPrice" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "ServiceMenuImport" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "totalRecords" INTEGER NOT NULL,
    "importedCount" INTEGER NOT NULL,
    "skippedCount" INTEGER NOT NULL,
    "failedCount" INTEGER NOT NULL,
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "categoriesCreated" INTEGER NOT NULL DEFAULT 0,
    "packagesCreated" INTEGER NOT NULL DEFAULT 0,
    "servicesCreated" INTEGER NOT NULL DEFAULT 0,
    "servicesReused" INTEGER NOT NULL DEFAULT 0,
    "summary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ServiceMenuImport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ServiceMenuImport_salonId_createdAt_idx" ON "ServiceMenuImport"("salonId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "ServiceMenuImport" ADD CONSTRAINT "ServiceMenuImport_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ServiceMenuImport" ADD CONSTRAINT "ServiceMenuImport_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

