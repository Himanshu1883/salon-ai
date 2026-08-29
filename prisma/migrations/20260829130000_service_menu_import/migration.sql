-- Service menu importer: couples audience, starting prices, import audit

DO $$ BEGIN
  ALTER TYPE "ServiceAudience" ADD VALUE 'COUPLES';
EXCEPTION
  WHEN duplicate_object THEN NULL;
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
  ALTER TABLE "ServiceMenuImport"
    ADD CONSTRAINT "ServiceMenuImport_salonId_fkey"
    FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ServiceMenuImport"
    ADD CONSTRAINT "ServiceMenuImport_uploadedById_fkey"
    FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
