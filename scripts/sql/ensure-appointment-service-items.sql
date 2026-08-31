CREATE TABLE IF NOT EXISTS "AppointmentServiceItem" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "employeeId" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AppointmentServiceItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AppointmentServiceItem_appointmentId_sortOrder_idx"
  ON "AppointmentServiceItem"("appointmentId", "sortOrder");

CREATE INDEX IF NOT EXISTS "AppointmentServiceItem_employeeId_status_idx"
  ON "AppointmentServiceItem"("employeeId", "status");

CREATE INDEX IF NOT EXISTS "AppointmentServiceItem_employeeId_scheduledAt_idx"
  ON "AppointmentServiceItem"("employeeId", "scheduledAt");

DO $$ BEGIN
  ALTER TABLE "AppointmentServiceItem"
    ADD CONSTRAINT "AppointmentServiceItem_appointmentId_fkey"
    FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "AppointmentServiceItem"
    ADD CONSTRAINT "AppointmentServiceItem_serviceId_fkey"
    FOREIGN KEY ("serviceId") REFERENCES "Service"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "AppointmentServiceItem"
    ADD CONSTRAINT "AppointmentServiceItem_employeeId_fkey"
    FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "InvoiceLineItem"
  ADD COLUMN IF NOT EXISTS "appointmentServiceItemId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "InvoiceLineItem_appointmentServiceItemId_key"
  ON "InvoiceLineItem"("appointmentServiceItemId");

DO $$ BEGIN
  ALTER TABLE "InvoiceLineItem"
    ADD CONSTRAINT "InvoiceLineItem_appointmentServiceItemId_fkey"
    FOREIGN KEY ("appointmentServiceItemId") REFERENCES "AppointmentServiceItem"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO "AppointmentServiceItem" (
    "id",
    "appointmentId",
    "serviceId",
    "employeeId",
    "price",
    "duration",
    "status",
    "scheduledAt",
    "sortOrder",
    "createdAt",
    "updatedAt"
)
SELECT
    md5(a."id" || ':asi'),
    a."id",
    a."serviceId",
    a."employeeId",
    s."price",
    s."duration",
    CASE
        WHEN a."status" IN ('completed', 'cancelled', 'no_show') THEN a."status"
        ELSE 'scheduled'
    END,
    a."scheduledAt",
    0,
    a."createdAt",
    a."updatedAt"
FROM "Appointment" a
INNER JOIN "Service" s ON s."id" = a."serviceId"
WHERE NOT EXISTS (
    SELECT 1 FROM "AppointmentServiceItem" i WHERE i."appointmentId" = a."id"
);
