import { getBrands, createBrand, updateBrand, deleteBrand } from "@/actions/inventory/brands";
import { getInventoryAccess } from "@/lib/inventory/permissions";
import { SimpleCrudClient } from "@/components/inventory/simple-crud-client";

export default async function BrandsPage() {
  const [brands, access] = await Promise.all([getBrands(), getInventoryAccess()]);
  const items = brands.map((b) => ({
    id: b.id,
    name: b.name,
    detail: `${b._count.stockItems} products`,
  }));
  return (
    <SimpleCrudClient
      title="Brands"
      description="Product brands for your salon inventory."
      items={items}
      canWrite={access.canWrite}
      actions={{ create: createBrand, update: updateBrand, remove: deleteBrand }}
      detailKey="detail"
    />
  );
}
