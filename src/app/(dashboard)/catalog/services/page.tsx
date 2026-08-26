import { Suspense } from "react";
import { ServiceMenuSkeleton } from "./service-menu-skeleton";
import { CatalogServicesContent } from "./catalog-services-content";

export default function CatalogServicesPage() {
  return (
    <Suspense fallback={<ServiceMenuSkeleton />}>
      <CatalogServicesContent />
    </Suspense>
  );
}
