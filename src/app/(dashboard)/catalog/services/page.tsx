import { getServicesGroupedByCategory } from "@/actions/services";
import { getEmployees } from "@/actions/employees";
import { ServiceMenuClient } from "./service-menu-client";

export default async function CatalogServicesPage() {
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
}
