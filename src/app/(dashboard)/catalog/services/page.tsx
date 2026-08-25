import { getServicesGroupedByCategory } from "@/actions/services";
import { getEmployees } from "@/actions/employees";
import { ServiceMenuClient } from "./service-menu-client";
import {
  CatalogSchemaUpgradeNotice,
  isCatalogSchemaError,
} from "./catalog-schema-notice";

export default async function CatalogServicesPage() {
  try {
    const [{ categories, uncategorized }, employees] = await Promise.all([
      getServicesGroupedByCategory(),
      getEmployees(),
    ]);

    return (
      <ServiceMenuClient
        categories={categories}
        uncategorized={uncategorized}
        employees={employees.map((e) => ({ id: e.id, name: e.name }))}
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
