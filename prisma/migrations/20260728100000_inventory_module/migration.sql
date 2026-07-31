-- AlterTable StockItem - extend product master
ALTER TABLE "StockItem" ADD COLUMN IF NOT EXISTS "barcode" TEXT;
ALTER TABLE "StockItem" ADD COLUMN IF NOT EXISTS "brandId" TEXT;
ALTER TABLE "StockItem" ADD COLUMN IF NOT EXISTS "supplierId" TEXT;
ALTER TABLE "StockItem" ADD COLUMN IF NOT EXISTS "maxLevel" INTEGER;
ALTER TABLE "StockItem" ADD COLUMN IF NOT EXISTS "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "StockItem" ADD COLUMN IF NOT EXISTS "retailPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "StockItem" ADD COLUMN IF NOT EXISTS "avgCost" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "StockItem" ADD COLUMN IF NOT EXISTS "gstRate" DOUBLE PRECISION NOT NULL DEFAULT 18;
ALTER TABLE "StockItem" ADD COLUMN IF NOT EXISTS "shelfLocation" TEXT;
ALTER TABLE "StockItem" ADD COLUMN IF NOT EXISTS "expiryDate" TIMESTAMP(3);
ALTER TABLE "StockItem" ADD COLUMN IF NOT EXISTS "batchNumber" TEXT;
ALTER TABLE "StockItem" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "StockItem" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "StockItem" ADD COLUMN IF NOT EXISTS "isRetail" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable InvoiceLineItem
ALTER TABLE "InvoiceLineItem" ADD COLUMN IF NOT EXISTS "stockItemId" TEXT;

-- CreateTable ProductBrand
CREATE TABLE IF NOT EXISTS "ProductBrand" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProductBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable PurchaseOrder
CREATE TABLE IF NOT EXISTS "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "supplierId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable PurchaseOrderLine
CREATE TABLE IF NOT EXISTS "PurchaseOrderLine" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "stockItemId" TEXT NOT NULL,
    "quantityOrdered" INTEGER NOT NULL,
    "quantityReceived" INTEGER NOT NULL DEFAULT 0,
    "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT "PurchaseOrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable GoodsReceipt
CREATE TABLE IF NOT EXISTS "GoodsReceipt" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "grnNumber" TEXT NOT NULL,
    "purchaseOrderId" TEXT,
    "supplierId" TEXT,
    "receivedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GoodsReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable GrnLineItem
CREATE TABLE IF NOT EXISTS "GrnLineItem" (
    "id" TEXT NOT NULL,
    "grnId" TEXT NOT NULL,
    "stockItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "batchNumber" TEXT,
    "expiryDate" TIMESTAMP(3),
    CONSTRAINT "GrnLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable StockAdjustment
CREATE TABLE IF NOT EXISTS "StockAdjustment" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "stockItemId" TEXT NOT NULL,
    "adjustmentType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "approvedById" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable StaffProductIssue
CREATE TABLE IF NOT EXISTS "StaffProductIssue" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "stockItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "quantityReturned" INTEGER NOT NULL DEFAULT 0,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'issued',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StaffProductIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable StaffProductReturn
CREATE TABLE IF NOT EXISTS "StaffProductReturn" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "returnDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    CONSTRAINT "StaffProductReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable ServiceRecipe
CREATE TABLE IF NOT EXISTS "ServiceRecipe" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "stockItemId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    CONSTRAINT "ServiceRecipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable StockLedgerEntry
CREATE TABLE IF NOT EXISTS "StockLedgerEntry" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "stockItemId" TEXT NOT NULL,
    "movementType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "quantityAfter" INTEGER NOT NULL,
    "unitCost" DOUBLE PRECISION,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "appointmentId" TEXT,
    "customerId" TEXT,
    "employeeId" TEXT,
    "invoiceId" TEXT,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable Branch
CREATE TABLE IF NOT EXISTS "Branch" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable BranchTransfer
CREATE TABLE IF NOT EXISTS "BranchTransfer" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "transferNumber" TEXT NOT NULL,
    "fromBranchId" TEXT NOT NULL,
    "toBranchId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "transferDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BranchTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable BranchTransferLine
CREATE TABLE IF NOT EXISTS "BranchTransferLine" (
    "id" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "stockItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "BranchTransferLine_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "ProductBrand_salonId_name_key" ON "ProductBrand"("salonId", "name");
CREATE INDEX IF NOT EXISTS "ProductBrand_salonId_idx" ON "ProductBrand"("salonId");
CREATE UNIQUE INDEX IF NOT EXISTS "PurchaseOrder_salonId_orderNumber_key" ON "PurchaseOrder"("salonId", "orderNumber");
CREATE INDEX IF NOT EXISTS "PurchaseOrder_salonId_status_idx" ON "PurchaseOrder"("salonId", "status");
CREATE INDEX IF NOT EXISTS "PurchaseOrder_salonId_orderDate_idx" ON "PurchaseOrder"("salonId", "orderDate");
CREATE INDEX IF NOT EXISTS "PurchaseOrderLine_purchaseOrderId_idx" ON "PurchaseOrderLine"("purchaseOrderId");
CREATE UNIQUE INDEX IF NOT EXISTS "GoodsReceipt_salonId_grnNumber_key" ON "GoodsReceipt"("salonId", "grnNumber");
CREATE INDEX IF NOT EXISTS "GoodsReceipt_salonId_receivedDate_idx" ON "GoodsReceipt"("salonId", "receivedDate");
CREATE INDEX IF NOT EXISTS "GrnLineItem_grnId_idx" ON "GrnLineItem"("grnId");
CREATE INDEX IF NOT EXISTS "StockAdjustment_salonId_createdAt_idx" ON "StockAdjustment"("salonId", "createdAt");
CREATE INDEX IF NOT EXISTS "StockAdjustment_salonId_stockItemId_idx" ON "StockAdjustment"("salonId", "stockItemId");
CREATE INDEX IF NOT EXISTS "StaffProductIssue_salonId_employeeId_idx" ON "StaffProductIssue"("salonId", "employeeId");
CREATE INDEX IF NOT EXISTS "StaffProductIssue_salonId_issueDate_idx" ON "StaffProductIssue"("salonId", "issueDate");
CREATE INDEX IF NOT EXISTS "StaffProductReturn_issueId_idx" ON "StaffProductReturn"("issueId");
CREATE UNIQUE INDEX IF NOT EXISTS "ServiceRecipe_serviceId_stockItemId_key" ON "ServiceRecipe"("serviceId", "stockItemId");
CREATE INDEX IF NOT EXISTS "ServiceRecipe_salonId_serviceId_idx" ON "ServiceRecipe"("salonId", "serviceId");
CREATE INDEX IF NOT EXISTS "StockLedgerEntry_salonId_stockItemId_createdAt_idx" ON "StockLedgerEntry"("salonId", "stockItemId", "createdAt");
CREATE INDEX IF NOT EXISTS "StockLedgerEntry_salonId_movementType_idx" ON "StockLedgerEntry"("salonId", "movementType");
CREATE INDEX IF NOT EXISTS "StockLedgerEntry_salonId_createdAt_idx" ON "StockLedgerEntry"("salonId", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "Branch_salonId_name_key" ON "Branch"("salonId", "name");
CREATE INDEX IF NOT EXISTS "Branch_salonId_idx" ON "Branch"("salonId");
CREATE UNIQUE INDEX IF NOT EXISTS "BranchTransfer_salonId_transferNumber_key" ON "BranchTransfer"("salonId", "transferNumber");
CREATE INDEX IF NOT EXISTS "BranchTransfer_salonId_status_idx" ON "BranchTransfer"("salonId", "status");
CREATE INDEX IF NOT EXISTS "BranchTransferLine_transferId_idx" ON "BranchTransferLine"("transferId");
CREATE INDEX IF NOT EXISTS "StockItem_salonId_status_idx" ON "StockItem"("salonId", "status");
CREATE INDEX IF NOT EXISTS "StockItem_salonId_expiryDate_idx" ON "StockItem"("salonId", "expiryDate");

-- ForeignKeys
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "ProductBrand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductBrand" ADD CONSTRAINT "ProductBrand_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PurchaseOrderLine" ADD CONSTRAINT "PurchaseOrderLine_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PurchaseOrderLine" ADD CONSTRAINT "PurchaseOrderLine_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GoodsReceipt" ADD CONSTRAINT "GoodsReceipt_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GoodsReceipt" ADD CONSTRAINT "GoodsReceipt_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GoodsReceipt" ADD CONSTRAINT "GoodsReceipt_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GrnLineItem" ADD CONSTRAINT "GrnLineItem_grnId_fkey" FOREIGN KEY ("grnId") REFERENCES "GoodsReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GrnLineItem" ADD CONSTRAINT "GrnLineItem_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockAdjustment" ADD CONSTRAINT "StockAdjustment_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StockAdjustment" ADD CONSTRAINT "StockAdjustment_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StaffProductIssue" ADD CONSTRAINT "StaffProductIssue_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StaffProductIssue" ADD CONSTRAINT "StaffProductIssue_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StaffProductIssue" ADD CONSTRAINT "StaffProductIssue_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StaffProductReturn" ADD CONSTRAINT "StaffProductReturn_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "StaffProductIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ServiceRecipe" ADD CONSTRAINT "ServiceRecipe_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ServiceRecipe" ADD CONSTRAINT "ServiceRecipe_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ServiceRecipe" ADD CONSTRAINT "ServiceRecipe_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockLedgerEntry" ADD CONSTRAINT "StockLedgerEntry_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StockLedgerEntry" ADD CONSTRAINT "StockLedgerEntry_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockLedgerEntry" ADD CONSTRAINT "StockLedgerEntry_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StockLedgerEntry" ADD CONSTRAINT "StockLedgerEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StockLedgerEntry" ADD CONSTRAINT "StockLedgerEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BranchTransfer" ADD CONSTRAINT "BranchTransfer_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BranchTransfer" ADD CONSTRAINT "BranchTransfer_fromBranchId_fkey" FOREIGN KEY ("fromBranchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BranchTransfer" ADD CONSTRAINT "BranchTransfer_toBranchId_fkey" FOREIGN KEY ("toBranchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BranchTransferLine" ADD CONSTRAINT "BranchTransferLine_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "BranchTransfer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BranchTransferLine" ADD CONSTRAINT "BranchTransferLine_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
