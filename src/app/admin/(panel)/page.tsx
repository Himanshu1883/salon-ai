import { getAdminStats } from "@/actions/platform-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CalendarPlus, CreditCard, AlertTriangle, Users } from "lucide-react";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const cards = [
    {
      title: "Total Salons",
      value: stats.totalSalons,
      icon: Building2,
      description: "Signed up on platform",
    },
    {
      title: "On Trial",
      value: stats.onTrial,
      icon: Users,
      description: "14-day trial period",
    },
    {
      title: "Active Monthly",
      value: stats.activeMonthly,
      icon: CreditCard,
      description: "Paying subscribers",
    },
    {
      title: "Past Due / Suspended",
      value: stats.pastDueOrSuspended,
      icon: AlertTriangle,
      description: "Needs attention",
    },
    {
      title: "Signed Up This Month",
      value: stats.signedUpThisMonth,
      icon: CalendarPlus,
      description: "New salons",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Platform overview for all salon tenants
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ title, value, icon: Icon, description }) => (
          <Card key={title} className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {title}
              </CardTitle>
              <Icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{value}</p>
              <p className="mt-1 text-xs text-slate-500">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
