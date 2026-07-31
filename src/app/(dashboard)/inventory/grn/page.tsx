import {
  getGoodsReceipts,
  getOpenPurchaseOrders,
} from "@/actions/inventory/grn";
import {
  getVendorsForSelect,
  getProductsForSelect,
} from "@/actions/inventory/purchase-orders";
import { getInventoryAccess } from "@/lib/inventory/permissions";
import { GrnClient } from "@/components/inventory/grn-client";

export default async function GrnPage() {
  const [receipts, openPOs, vendors, products, access] = await Promise.all([
    getGoodsReceipts(),
    getOpenPurchaseOrders(),
    getVendorsForSelect(),
    getProductsForSelect(),
    getInventoryAccess(),
  ]);
  return (
    <GrnClient
      receipts={receipts}
      openPOs={openPOs}
      vendors={vendors}
      products={products}
      canWrite={access.canWrite}
    />
  );
}
