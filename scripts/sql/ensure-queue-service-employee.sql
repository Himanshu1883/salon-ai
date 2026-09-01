ALTER TABLE "QueueService" ADD COLUMN IF NOT EXISTS "employeeId" TEXT;

CREATE INDEX IF NOT EXISTS "QueueService_employeeId_idx" ON "QueueService"("employeeId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'QueueService_employeeId_fkey'
  ) THEN
    ALTER TABLE "QueueService"
      ADD CONSTRAINT "QueueService_employeeId_fkey"
      FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
