import {
  getServiceRecipes,
  getServicesForRecipes,
} from "@/actions/inventory/service-recipes";
import { getProductsForSelect } from "@/actions/inventory/purchase-orders";
import { getInventoryAccess } from "@/lib/inventory/permissions";
import { ServiceRecipesClient } from "@/components/inventory/service-recipes-client";

export default async function ServiceRecipesPage() {
  const [recipes, services, products, access] = await Promise.all([
    getServiceRecipes(),
    getServicesForRecipes(),
    getProductsForSelect(),
    getInventoryAccess(),
  ]);
  return (
    <ServiceRecipesClient
      recipes={recipes}
      services={services}
      products={products}
      canWrite={access.canWrite}
    />
  );
}
