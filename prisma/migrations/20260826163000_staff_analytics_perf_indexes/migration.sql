-- Additional staff analytics indexes (idempotent)
CREATE INDEX IF NOT EXISTS "Shift_salonId_date_isWorking_employeeId_idx"
  ON "Shift"("salonId", "date", "isWorking", "employeeId");

CREATE INDEX IF NOT EXISTS "AttendanceRecord_salonId_employeeId_date_idx"
  ON "AttendanceRecord"("salonId", "employeeId", "date");

CREATE INDEX IF NOT EXISTS "InvoiceLineItem_invoiceId_idx"
  ON "InvoiceLineItem"("invoiceId");

CREATE INDEX IF NOT EXISTS "Appointment_salonId_scheduledAt_employeeId_status_idx"
  ON "Appointment"("salonId", "scheduledAt", "employeeId", "status");
