-- Link salon login accounts to team member (Employee) profiles
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "employeeId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "User_employeeId_key" ON "User"("employeeId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'User_employeeId_fkey'
  ) THEN
    ALTER TABLE "User"
      ADD CONSTRAINT "User_employeeId_fkey"
      FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
