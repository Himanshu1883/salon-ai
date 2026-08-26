-- Per-service staff on invoice line items (idempotent)
ALTER TABLE "InvoiceLineItem" ADD COLUMN IF NOT EXISTS "employeeId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'InvoiceLineItem_employeeId_fkey'
  ) THEN
    ALTER TABLE "InvoiceLineItem"
      ADD CONSTRAINT "InvoiceLineItem_employeeId_fkey"
      FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
