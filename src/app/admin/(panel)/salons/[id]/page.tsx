import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
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
      <Link
        href="/admin/salons"
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to salons
      </Link>
      <SalonDetailClient salon={salon} />
    </div>
  );
}
