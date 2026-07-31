import { getAdjustments } from "@/actions/inventory/adjustments";
import { getProductsForSelect } from "@/actions/inventory/purchase-orders";
import { getInventoryAccess } from "@/lib/inventory/permissions";
import { AdjustmentsClient } from "@/components/inventory/adjustments-client";

export default async function AdjustmentsPage() {
  const [adjustments, products, access] = await Promise.all([
    getAdjustments(),
    getProductsForSelect(),
    getInventoryAccess(),
  ]);
  return (
    <AdjustmentsClient
      adjustments={adjustments}
      products={products}
      canWrite={access.canWrite}
    />
  );
}
