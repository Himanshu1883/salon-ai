-- AlterTable
ALTER TABLE "Employee" ADD COLUMN "addressLine1" TEXT;
ALTER TABLE "Employee" ADD COLUMN "addressLine2" TEXT;
ALTER TABLE "Employee" ADD COLUMN "city" TEXT;
ALTER TABLE "Employee" ADD COLUMN "state" TEXT;
ALTER TABLE "Employee" ADD COLUMN "pincode" TEXT;
ALTER TABLE "Employee" ADD COLUMN "country" TEXT DEFAULT 'India';
ALTER TABLE "Employee" ADD COLUMN "aadharNumber" TEXT;
ALTER TABLE "Employee" ADD COLUMN "panNumber" TEXT;
ALTER TABLE "Employee" ADD COLUMN "aadharDocumentUrl" TEXT;
ALTER TABLE "Employee" ADD COLUMN "panDocumentUrl" TEXT;
ALTER TABLE "Employee" ADD COLUMN "offerLetterUrl" TEXT;
ALTER TABLE "Employee" ADD COLUMN "otherDocuments" TEXT;
