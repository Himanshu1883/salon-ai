import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Building2 } from "lucide-react";
import { getSalonDetail } from "@/actions/platform-admin";
import { SalonDetailClient } from "./salon-detail-client";

export default async function AdminSalonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const salon = await getSalonDetail(id);

  if (!salon) {
    notFound();
  }

  return (
    <div className="space-y-6">
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
      <SalonDetailClient salon={salon} />
    </div>
  );
}
