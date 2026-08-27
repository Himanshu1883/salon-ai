import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight, Building2 } from "lucide-react";
import { getSalonDetail } from "@/actions/platform-admin";
import { SalonDetailClient } from "./salon-detail-client";
import { getAdminPageContext } from "@/lib/admin-page-context";

async function SalonDetailContent({
  id,
  readOnly,
}: {
  id: string;
  readOnly: boolean;
}) {
  const salon = await getSalonDetail(id);

  if (!salon) {
    notFound();
  }

  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm">
          <li>
            <Link
              href="/admin/salons"
              className="font-medium text-dashboard-muted transition hover:text-dashboard-primary"
            >
              Salons
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-4 w-4 text-dashboard-muted/60" />
          </li>
          <li className="flex items-center gap-1.5 font-semibold text-dashboard-text">
            <Building2 className="h-4 w-4 text-dashboard-primary" />
            {salon.name}
          </li>
        </ol>
      </nav>
      <SalonDetailClient salon={salon} readOnly={readOnly} />
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-5 w-48 rounded bg-stone-200" />
      <div className="h-96 rounded-2xl bg-stone-100" />
    </div>
  );
}

export default async function AdminSalonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { superAdmin } = await getAdminPageContext();

  return (
    <div className="space-y-6">
      <Suspense fallback={<DetailSkeleton />}>
        <SalonDetailContent id={id} readOnly={!superAdmin} />
      </Suspense>
    </div>
  );
}
