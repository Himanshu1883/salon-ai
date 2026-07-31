import {
  getLedgerEntries,
  getMovementTypeOptions,
} from "@/actions/inventory/ledger";
import { LedgerClient } from "@/components/inventory/ledger-client";

export default async function LedgerPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const [entries, movementTypes] = await Promise.all([
    getLedgerEntries({
      movementType: params.type,
      limit: 200,
    }),
    getMovementTypeOptions(),
  ]);
  return <LedgerClient entries={entries} movementTypes={movementTypes} />;
}
