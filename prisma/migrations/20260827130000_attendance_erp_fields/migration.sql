-- Extend attendance for ERP module (status, worked minutes, corrections, audit)
ALTER TABLE "AttendanceRecord" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'WORKING';
ALTER TABLE "AttendanceRecord" ADD COLUMN IF NOT EXISTS "totalWorkedMinutes" INTEGER;
ALTER TABLE "AttendanceRecord" ADD COLUMN IF NOT EXISTS "lateMinutes" INTEGER;
ALTER TABLE "AttendanceRecord" ADD COLUMN IF NOT EXISTS "earlyCheckoutMinutes" INTEGER;
ALTER TABLE "AttendanceRecord" ADD COLUMN IF NOT EXISTS "createdByUserId" TEXT;
ALTER TABLE "AttendanceRecord" ADD COLUMN IF NOT EXISTS "correctedByUserId" TEXT;
ALTER TABLE "AttendanceRecord" ADD COLUMN IF NOT EXISTS "correctedAt" TIMESTAMP(3);
ALTER TABLE "AttendanceRecord" ADD COLUMN IF NOT EXISTS "correctionReason" TEXT;

CREATE INDEX IF NOT EXISTS "AttendanceRecord_salonId_status_date_idx" ON "AttendanceRecord"("salonId", "status", "date");

-- Backfill status for existing rows
UPDATE "AttendanceRecord"
SET "status" = CASE
  WHEN "checkOutAt" IS NULL THEN 'WORKING'
  ELSE 'COMPLETED'
END
WHERE "status" IS NULL OR "status" = '';

UPDATE "AttendanceRecord"
SET "totalWorkedMinutes" = GREATEST(
  0,
  FLOOR(EXTRACT(EPOCH FROM ("checkOutAt" - "checkInAt")) / 60)
)::INTEGER
WHERE "checkOutAt" IS NOT NULL AND "totalWorkedMinutes" IS NULL;

CREATE TABLE IF NOT EXISTS "AttendanceAuditLog" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "changedByUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previousCheckInAt" TIMESTAMP(3),
    "previousCheckOutAt" TIMESTAMP(3),
    "newCheckInAt" TIMESTAMP(3),
    "newCheckOutAt" TIMESTAMP(3),
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AttendanceAuditLog_salonId_attendanceId_idx" ON "AttendanceAuditLog"("salonId", "attendanceId");
CREATE INDEX IF NOT EXISTS "AttendanceAuditLog_attendanceId_idx" ON "AttendanceAuditLog"("attendanceId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AttendanceAuditLog_attendanceId_fkey'
  ) THEN
    ALTER TABLE "AttendanceAuditLog"
      ADD CONSTRAINT "AttendanceAuditLog_attendanceId_fkey"
      FOREIGN KEY ("attendanceId") REFERENCES "AttendanceRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
