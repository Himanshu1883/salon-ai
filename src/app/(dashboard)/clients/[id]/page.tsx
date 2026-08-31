import { notFound } from "next/navigation";
import { getCustomerStats } from "@/actions/customers";
import { getCustomerMembershipProfile } from "@/actions/memberships";
import { CustomerDetailClient } from "@/app/(dashboard)/customers/[id]/customer-detail-client";
import { requirePermission, PermissionDeniedError } from "@/lib/permissions/require";
import { PermissionDeniedScreen } from "@/components/permissions/permission-denied-screen";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    await requirePermission("customers.view");
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      return <PermissionDeniedScreen featureName="Customers" />;
    }
    throw error;
  }

  const { id } = await params;
  const [stats, membershipProfile] = await Promise.all([
    getCustomerStats(id),
    getCustomerMembershipProfile(id),
  ]);

  if (!stats) notFound();

  return (
    <CustomerDetailClient stats={stats} membershipProfile={membershipProfile} />
  );
}
