-- Staff analytics query performance (idempotent)
CREATE INDEX IF NOT EXISTS "Invoice_salonId_status_paidAt_idx"
  ON "Invoice"("salonId", "status", "paidAt");

CREATE INDEX IF NOT EXISTS "Invoice_salonId_employeeId_status_paidAt_idx"
  ON "Invoice"("salonId", "employeeId", "status", "paidAt");

CREATE INDEX IF NOT EXISTS "InvoiceLineItem_employeeId_idx"
  ON "InvoiceLineItem"("employeeId");

CREATE INDEX IF NOT EXISTS "Appointment_salonId_employeeId_scheduledAt_idx"
  ON "Appointment"("salonId", "employeeId", "scheduledAt");

CREATE INDEX IF NOT EXISTS "Appointment_salonId_scheduledAt_status_idx"
  ON "Appointment"("salonId", "scheduledAt", "status");
