-- AlterTable
ALTER TABLE "Salon" ADD COLUMN "slug" TEXT;

-- Temporary unique slugs for existing rows
UPDATE "Salon" SET "slug" = 'salon-' || REPLACE("id", '-', '') WHERE "slug" IS NULL;

ALTER TABLE "Salon" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "Salon_slug_key" ON "Salon"("slug");
