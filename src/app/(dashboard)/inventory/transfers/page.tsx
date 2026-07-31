import {
  getTransfers,
  getBranches,
  ensureDefaultBranch,
} from "@/actions/inventory/transfers";
import { getProductsForSelect } from "@/actions/inventory/purchase-orders";
import { getInventoryAccess } from "@/lib/inventory/permissions";
import { TransfersClient } from "@/components/inventory/transfers-client";

export default async function TransfersPage() {
  await ensureDefaultBranch();
  const [transfers, branches, products, access] = await Promise.all([
    getTransfers(),
    getBranches(),
    getProductsForSelect(),
    getInventoryAccess(),
  ]);
  return (
    <TransfersClient
      transfers={transfers}
      branches={branches}
      products={products}
      canWrite={access.canWrite}
    />
  );
}
