import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/actions/suppliers";
import { getInventoryAccess } from "@/lib/inventory/permissions";
import { SimpleCrudClient } from "@/components/inventory/simple-crud-client";

export default async function VendorsPage() {
  const [suppliers, access] = await Promise.all([
    getSuppliers(),
    getInventoryAccess(),
  ]);
  return (
    <SimpleCrudClient
      title="Vendors"
      description="Suppliers and vendors for purchase orders and GRN."
      items={suppliers}
      canWrite={access.canWrite}
      actions={{
        create: createSupplier,
        update: updateSupplier,
        remove: deleteSupplier,
      }}
      fields={[
        { name: "name", label: "Vendor name" },
        { name: "phone", label: "Phone", optional: true },
        { name: "email", label: "Email", type: "email", optional: true },
        { name: "address", label: "Address", optional: true },
        { name: "notes", label: "Notes", optional: true },
      ]}
    />
  );
}
