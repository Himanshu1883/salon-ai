import { getServicesGroupedByCategory } from "@/actions/services";
import { getEmployeeOptions } from "@/actions/employees";
import { ServiceMenuClient } from "./service-menu-client";
import {
  CatalogSchemaUpgradeNotice,
  isCatalogSchemaError,
} from "./catalog-schema-notice";

export async function CatalogServicesContent() {
  try {
    const [{ categories, uncategorized }, employees] = await Promise.all([
      getServicesGroupedByCategory(),
      getEmployeeOptions(),
    ]);

    return (
      <ServiceMenuClient
        categories={categories}
        uncategorized={uncategorized}
        employees={employees}
      />
    );
  } catch (error) {
    if (isCatalogSchemaError(error)) {
      console.error("Catalog schema missing on database:", error);
      return <CatalogSchemaUpgradeNotice />;
    }
    throw error;
  }
}
