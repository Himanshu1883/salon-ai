import { getCustomers } from "@/actions/customers";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Gift, Sparkles } from "lucide-react";

export default async function ClientLoyaltyPage() {
  const { totalCount, customers } = await getCustomers({
    page: 1,
    pageSize: 5,
    sort: "createdAt_desc",
  });

  const withPoints = customers.filter((c) => c.loyaltyPoints > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Client loyalty</h1>
        <p className="mt-1 text-stone-500">
          Reward repeat visits with a points program.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold">Loyalty program coming soon</p>
            <p className="mt-1 text-sm text-violet-100">
              Earn rules, rewards, and automatic point accrual on paid invoices
              will be available in a future update. Clients can already store a
              loyalty balance for manual tracking.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Total clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              With points balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{withPoints.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Program status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Preview</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5 text-violet-600" />
            Recent clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <p className="text-sm text-stone-500">No clients yet.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {customers.map((client) => (
                <li
                  key={client.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="font-medium text-stone-900">
                    {client.name}
                  </span>
                  <span className="tabular-nums text-stone-500">
                    {client.loyaltyPoints > 0
                      ? `${client.loyaltyPoints} pts`
                      : "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
