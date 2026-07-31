-- CreateIndex
CREATE INDEX "Employee_salonId_idx" ON "Employee"("salonId");

-- CreateIndex
CREATE INDEX "Employee_salonId_status_idx" ON "Employee"("salonId", "status");

-- CreateIndex
CREATE INDEX "Employee_salonId_name_idx" ON "Employee"("salonId", "name");
