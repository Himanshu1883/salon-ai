-- CreateEnum
CREATE TYPE "HairConsultationStatus" AS ENUM ('DRAFT', 'PHOTO_CAPTURED', 'ANALYZED', 'STYLES_TRIED', 'STYLE_SELECTED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "HairConsultationPhotoType" AS ENUM ('ORIGINAL', 'PREVIEW', 'ACTUAL_RESULT', 'THUMBNAIL');
CREATE TYPE "FaceShape" AS ENUM ('OVAL', 'ROUND', 'SQUARE', 'OBLONG', 'HEART', 'DIAMOND');
CREATE TYPE "HairGenderCategory" AS ENUM ('MEN', 'WOMEN', 'UNISEX');

-- CreateTable
CREATE TABLE "HairConsultationSettings" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "disclaimer" TEXT NOT NULL DEFAULT 'AI preview is an approximate visual simulation. Final results may vary depending on hair length, texture, density, condition and styling.',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HairConsultationSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HairstyleCategory" (
    "id" TEXT NOT NULL,
    "salonId" TEXT,
    "name" TEXT NOT NULL,
    "genderCategory" "HairGenderCategory" NOT NULL DEFAULT 'UNISEX',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HairstyleCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Hairstyle" (
    "id" TEXT NOT NULL,
    "salonId" TEXT,
    "categoryId" TEXT,
    "serviceId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailPath" TEXT,
    "previewImagePath" TEXT,
    "aiPromptInstructions" TEXT,
    "hairLength" TEXT,
    "hairType" TEXT,
    "suitableFaceShapes" "FaceShape"[],
    "genderCategory" "HairGenderCategory" NOT NULL DEFAULT 'UNISEX',
    "recommendedAgeGroup" TEXT,
    "difficulty" TEXT,
    "serviceDuration" INTEGER,
    "price" DOUBLE PRECISION,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "isTrending" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hairstyle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HairColor" (
    "id" TEXT NOT NULL,
    "salonId" TEXT,
    "name" TEXT NOT NULL,
    "hexColor" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HairColor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HairConsultation" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "branchId" TEXT,
    "customerId" TEXT NOT NULL,
    "serviceId" TEXT,
    "employeeId" TEXT,
    "selectedHairstyleId" TEXT,
    "selectedHairColorId" TEXT,
    "status" "HairConsultationStatus" NOT NULL DEFAULT 'DRAFT',
    "detectedFaceShape" "FaceShape",
    "faceShapeOverride" "FaceShape",
    "faceShapeConfidence" DOUBLE PRECISION,
    "faceAnalysisJson" JSONB,
    "aiRecommendationsJson" JSONB,
    "notes" TEXT,
    "servicePrice" DOUBLE PRECISION,
    "serviceDuration" INTEGER,
    "customerApproved" BOOLEAN NOT NULL DEFAULT false,
    "customerApprovedAt" TIMESTAMP(3),
    "satisfactionRating" INTEGER,
    "wouldChooseAgain" BOOLEAN,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HairConsultation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HairConsultationPhoto" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "type" "HairConsultationPhotoType" NOT NULL,
    "storagePath" TEXT NOT NULL,
    "thumbnailPath" TEXT,
    "mimeType" TEXT NOT NULL DEFAULT 'image/jpeg',
    "width" INTEGER,
    "height" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HairConsultationPhoto_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HairConsultationSelection" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "hairstyleId" TEXT NOT NULL,
    "hairColorId" TEXT,
    "previewPhotoId" TEXT,
    "matchScore" DOUBLE PRECISION,
    "isCustomerChoice" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HairConsultationSelection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HairConsultationFeedback" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "wouldChooseAgain" BOOLEAN NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HairConsultationFeedback_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "HairConsultationSettings_salonId_key" ON "HairConsultationSettings"("salonId");
CREATE INDEX "HairstyleCategory_salonId_sortOrder_idx" ON "HairstyleCategory"("salonId", "sortOrder");
CREATE INDEX "Hairstyle_salonId_isActive_sortOrder_idx" ON "Hairstyle"("salonId", "isActive", "sortOrder");
CREATE INDEX "Hairstyle_categoryId_idx" ON "Hairstyle"("categoryId");
CREATE INDEX "HairColor_salonId_isActive_idx" ON "HairColor"("salonId", "isActive");
CREATE INDEX "HairConsultation_salonId_customerId_createdAt_idx" ON "HairConsultation"("salonId", "customerId", "createdAt");
CREATE INDEX "HairConsultation_salonId_employeeId_idx" ON "HairConsultation"("salonId", "employeeId");
CREATE INDEX "HairConsultation_salonId_status_idx" ON "HairConsultation"("salonId", "status");
CREATE INDEX "HairConsultationPhoto_consultationId_type_idx" ON "HairConsultationPhoto"("consultationId", "type");
CREATE INDEX "HairConsultationSelection_consultationId_idx" ON "HairConsultationSelection"("consultationId");
CREATE UNIQUE INDEX "HairConsultationFeedback_consultationId_key" ON "HairConsultationFeedback"("consultationId");

-- ForeignKeys
ALTER TABLE "HairConsultationSettings" ADD CONSTRAINT "HairConsultationSettings_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HairstyleCategory" ADD CONSTRAINT "HairstyleCategory_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Hairstyle" ADD CONSTRAINT "Hairstyle_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Hairstyle" ADD CONSTRAINT "Hairstyle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "HairstyleCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Hairstyle" ADD CONSTRAINT "Hairstyle_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HairColor" ADD CONSTRAINT "HairColor_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HairConsultation" ADD CONSTRAINT "HairConsultation_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HairConsultation" ADD CONSTRAINT "HairConsultation_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HairConsultation" ADD CONSTRAINT "HairConsultation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HairConsultation" ADD CONSTRAINT "HairConsultation_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HairConsultation" ADD CONSTRAINT "HairConsultation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HairConsultation" ADD CONSTRAINT "HairConsultation_selectedHairstyleId_fkey" FOREIGN KEY ("selectedHairstyleId") REFERENCES "Hairstyle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HairConsultation" ADD CONSTRAINT "HairConsultation_selectedHairColorId_fkey" FOREIGN KEY ("selectedHairColorId") REFERENCES "HairColor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HairConsultationPhoto" ADD CONSTRAINT "HairConsultationPhoto_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "HairConsultation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HairConsultationSelection" ADD CONSTRAINT "HairConsultationSelection_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "HairConsultation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HairConsultationSelection" ADD CONSTRAINT "HairConsultationSelection_hairstyleId_fkey" FOREIGN KEY ("hairstyleId") REFERENCES "Hairstyle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HairConsultationSelection" ADD CONSTRAINT "HairConsultationSelection_hairColorId_fkey" FOREIGN KEY ("hairColorId") REFERENCES "HairColor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HairConsultationSelection" ADD CONSTRAINT "HairConsultationSelection_previewPhotoId_fkey" FOREIGN KEY ("previewPhotoId") REFERENCES "HairConsultationPhoto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HairConsultationFeedback" ADD CONSTRAINT "HairConsultationFeedback_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "HairConsultation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
