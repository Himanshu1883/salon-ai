-- AlterTable
ALTER TABLE "QueueEntry" ADD COLUMN "appointmentId" TEXT;

-- CreateIndex
CREATE INDEX "QueueEntry_salonId_appointmentId_idx" ON "QueueEntry"("salonId", "appointmentId");

-- AddForeignKey
ALTER TABLE "QueueEntry" ADD CONSTRAINT "QueueEntry_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
