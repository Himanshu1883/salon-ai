import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AccessGate } from "@/components/dashboard/access-gate";
import { PlanGate } from "@/components/plans/plan-gate";
import { PlanProvider } from "@/components/plans/plan-provider";
import { getSalonAccessBlocked } from "@/actions/subscription";
import { getSalonPlan } from "@/lib/plan-access";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (!session?.user) redirect("/");
  if (session.user.isSuperAdmin) redirect("/admin");
  const salonId = session.user.salonId;
  if (!salonId) redirect("/");

  const userRole = session.user.role ?? "owner";
  const showSettings = userRole === "owner" || userRole === "manager";

  const [blocked, plan] = await Promise.all([
    getSalonAccessBlocked(salonId),
    getSalonPlan(salonId),
  ]);

  return (
    <PlanProvider plan={plan}>
      <DashboardShell
        salonName={session.user.salonName ?? "Salon"}
        userName={session.user.name}
        userRole={userRole}
        showSettings={showSettings}
        accessBlocked={blocked}
        plan={plan}
      >
        <AccessGate blocked={blocked}>
          <PlanGate plan={plan}>{children}</PlanGate>
        </AccessGate>
      </DashboardShell>
    </PlanProvider>
  );
}
