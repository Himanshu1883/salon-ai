-- Performance indexes for customer enrichment, queue, and invoice lookups

CREATE INDEX IF NOT EXISTS "Invoice_salonId_status_customerId_idx"
  ON "Invoice" ("salonId", "status", "customerId");

CREATE INDEX IF NOT EXISTS "Invoice_salonId_status_customerPhone_idx"
  ON "Invoice" ("salonId", "status", "customerPhone");

CREATE INDEX IF NOT EXISTS "QueueEntry_salonId_status_customerId_idx"
  ON "QueueEntry" ("salonId", "status", "customerId");

CREATE INDEX IF NOT EXISTS "Appointment_salonId_status_customerId_idx"
  ON "Appointment" ("salonId", "status", "customerId");

CREATE INDEX IF NOT EXISTS "QueueEntry_salonId_status_position_idx"
  ON "QueueEntry" ("salonId", "status", "position");

CREATE INDEX IF NOT EXISTS "SmsReminder_salonId_status_idx"
  ON "SmsReminder" ("salonId", "status");
