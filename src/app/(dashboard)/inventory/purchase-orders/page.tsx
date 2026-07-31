import {
  getPurchaseOrders,
  getVendorsForSelect,
  getProductsForSelect,
} from "@/actions/inventory/purchase-orders";
import { getInventoryAccess } from "@/lib/inventory/permissions";
import { PurchaseOrdersClient } from "@/components/inventory/purchase-orders-client";

export default async function PurchaseOrdersPage() {
  const [orders, vendors, products, access] = await Promise.all([
    getPurchaseOrders(),
    getVendorsForSelect(),
    getProductsForSelect(),
    getInventoryAccess(),
  ]);
  return (
    <PurchaseOrdersClient
      orders={orders}
      vendors={vendors}
      products={products}
      canWrite={access.canWrite}
    />
  );
}
