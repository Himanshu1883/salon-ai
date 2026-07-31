import {
  getStockCategories,
} from "@/actions/stock-categories";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/inventory/categories";
import { getInventoryAccess } from "@/lib/inventory/permissions";
import { SimpleCrudClient } from "@/components/inventory/simple-crud-client";

export default async function CategoriesPage() {
  const [categories, access] = await Promise.all([
    getStockCategories(),
    getInventoryAccess(),
  ]);
  return (
    <SimpleCrudClient
      title="Categories"
      description="Organize products by category — shampoo, color, tools, supplies."
      items={categories}
      canWrite={access.canWrite}
      actions={{
        create: createCategory,
        update: updateCategory,
        remove: deleteCategory,
      }}
    />
  );
}
