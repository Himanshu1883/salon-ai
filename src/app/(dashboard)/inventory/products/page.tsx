import {
  getProducts,
  getBrandsForSelect,
  getCategoriesForSelect,
  getSuppliersForSelect,
} from "@/actions/inventory/products";
import { getInventoryAccess } from "@/lib/inventory/permissions";
import { ProductsClient } from "@/components/inventory/products-client";

export default async function InventoryProductsPage() {
  const [products, categories, brands, suppliers, access] = await Promise.all([
    getProducts(),
    getCategoriesForSelect(),
    getBrandsForSelect(),
    getSuppliersForSelect(),
    getInventoryAccess(),
  ]);

  return (
    <ProductsClient
      products={products}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      brands={brands}
      suppliers={suppliers}
      canWrite={access.canWrite}
    />
  );
}
