"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Cake, Crown, TrendingUp, Users } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { getInitials } from "@/lib/utils";
import type { CustomerListItem } from "@/actions/customers";
import type { ClientSummaryStats } from "./types";
import {
  getInactiveClients,
  getRecentlyAdded,
  getTopSpenders,
} from "./clients-utils";

const MEMBERSHIP_COLORS = ["#6C3BFF", "#8B5CF6", "#FF2D6F", "#E8ECF4"];

function SidebarSection({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl border border-[#E8ECF4] bg-white p-3 shadow-[0_4px_24px_rgba(28,16,61,0.05)] sm:rounded-[20px] sm:p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#1C103D]">{title}</h3>
        {action}
      </div>
      {children}
    </motion.div>
  );
}

type ClientsInsightsPanelProps = {
  customers: CustomerListItem[];
  stats: ClientSummaryStats;
};

export function ClientsInsightsPanel({
  customers,
  stats,
}: ClientsInsightsPanelProps) {
  const topSpenders = getTopSpenders(customers);
  const recentlyAdded = getRecentlyAdded(customers);
  const inactive = getInactiveClients(customers);

  const overviewCards = [
    {
      label: "Total Clients",
      value: stats.totalClients,
      pct: "100%",
    },
    {
      label: "New This Month",
      value: stats.newThisMonth,
      pct: stats.totalClients
        ? `+${Math.round((stats.newThisMonth / stats.totalClients) * 100)}%`
        : "—",
    },
    {
      label: "Active Clients",
      value: stats.activeClients,
      pct: stats.totalClients
        ? `${Math.round((stats.activeClients / stats.totalClients) * 100)}%`
        : "—",
    },
    {
      label: "VIP Clients",
      value: stats.vipMembers,
      pct: stats.totalClients
        ? `${Math.round((stats.vipMembers / stats.totalClients) * 100)}%`
        : "—",
    },
  ];

  const membershipData = [
    { name: "VIP", value: stats.vipMembers },
    { name: "Active", value: stats.activeClients - stats.vipMembers },
    { name: "New", value: stats.newThisMonth },
    {
      name: "Other",
      value: Math.max(
        0,
        stats.totalClients -
          stats.vipMembers -
          (stats.activeClients - stats.vipMembers) -
          stats.newThisMonth
      ),
    },
  ].filter((d) => d.value > 0);

  const revenueByClient = topSpenders.slice(0, 5).map((c) => ({
    name: c.name.split(" ")[0],
    revenue: c.totalSales,
  }));

  return (
    <aside className="min-w-0 w-full space-y-3 xl:w-[320px] xl:shrink-0 xl:space-y-4">
      <SidebarSection title="Clients Overview">
        <div className="grid grid-cols-2 gap-2">
          {overviewCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl bg-[#F7F8FC] p-2 transition-all hover:bg-white hover:shadow-sm sm:p-3"
            >
              <p className="text-base font-bold text-[#1C103D] sm:text-xl">{card.value}</p>
              <p className="text-[10px] font-medium text-[#6B7280]">
                {card.label}
              </p>
              <p className="text-[10px] font-medium text-emerald-600">
                {card.pct}
              </p>
            </div>
          ))}
        </div>
      </SidebarSection>

      <SidebarSection
        title="Top Spending"
        action={
          <Link
            href="/reports/clients/top-spenders"
            className="text-xs font-medium text-[#6C3BFF] hover:underline"
          >
            View all
          </Link>
        }
      >
        {topSpenders.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No spending data yet</p>
        ) : (
          <div className="space-y-2">
            {topSpenders.map((client, i) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="flex items-center gap-3 rounded-xl p-2 transition-all hover:bg-[#F7F8FC]"
              >
                <span className="w-4 text-xs font-medium text-[#9CA3AF]">
                  {i + 1}
                </span>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6C3BFF] to-[#FF2D6F] text-[10px] font-bold text-white">
                  {getInitials(client.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1C103D]">
                    {client.name}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums text-[#1C103D]">
                  {formatCurrency(client.totalSales)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </SidebarSection>

      <SidebarSection title="Birthday This Week">
        {stats.birthdayToday === 0 ? (
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Cake className="h-4 w-4 text-[#FF2D6F]" />
            No birthdays this week
          </div>
        ) : (
          <p className="text-sm text-[#1C103D]">
            {stats.birthdayToday} client(s) celebrating
          </p>
        )}
      </SidebarSection>

      <SidebarSection title="Recently Added">
        {recentlyAdded.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No recent clients</p>
        ) : (
          <div className="space-y-2">
            {recentlyAdded.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="flex items-center gap-2 rounded-xl p-2 hover:bg-[#F7F8FC]"
              >
                <Users className="h-3.5 w-3.5 text-[#6C3BFF]" />
                <span className="truncate text-sm text-[#1C103D]">
                  {client.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </SidebarSection>

      <SidebarSection title="Inactive">
        {inactive.length === 0 ? (
          <p className="text-sm text-[#6B7280]">All clients are active</p>
        ) : (
          <div className="space-y-2">
            {inactive.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="flex items-center gap-2 rounded-xl p-2 hover:bg-[#F7F8FC]"
              >
                <span className="text-sm text-[#6B7280]">{client.name}</span>
              </Link>
            ))}
          </div>
        )}
      </SidebarSection>

      <SidebarSection title="Membership Distribution">
        {membershipData.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No data</p>
        ) : (
          <div className="h-[120px] sm:h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={membershipData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={2}
                >
                  {membershipData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={MEMBERSHIP_COLORS[index % MEMBERSHIP_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </SidebarSection>

      <SidebarSection title="Revenue by Client">
        {revenueByClient.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No revenue data</p>
        ) : (
          <div className="h-[120px] sm:h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByClient} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF4" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} width={40} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="revenue" fill="#6C3BFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </SidebarSection>

      <SidebarSection title="Customer Growth">
        <div className="h-[110px] sm:h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.growthData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="clientGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C3BFF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6C3BFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF4" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} width={24} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#6C3BFF"
                fill="url(#clientGrowth)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SidebarSection>

      <SidebarSection title="Recent Activity">
        <div className="space-y-2">
          {recentlyAdded.slice(0, 3).map((client) => (
            <div
              key={client.id}
              className="flex items-start gap-2 rounded-xl bg-[#F7F8FC] p-2.5 text-sm"
            >
              <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              <div>
                <p className="font-medium text-[#1C103D]">{client.name} added</p>
                <p className="text-xs text-[#9CA3AF]">New client profile</p>
              </div>
            </div>
          ))}
          {recentlyAdded.length === 0 && (
            <p className="text-sm text-[#6B7280]">No recent activity</p>
          )}
        </div>
      </SidebarSection>

      <SidebarSection title="Upcoming Appointments">
        <p className="text-sm text-[#6B7280]">
          View appointments from the appointments page.
        </p>
        <Link
          href="/sales/appointments"
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#6C3BFF] hover:underline"
        >
          View appointments
          <ArrowRight className="h-3 w-3" />
        </Link>
      </SidebarSection>

      <SidebarSection title="AI Insights">
        <div className="rounded-xl bg-gradient-to-br from-[#EDE9FE] to-[#FCE7F3] p-3">
          <div className="flex items-start gap-2">
            <Crown className="mt-0.5 h-4 w-4 shrink-0 text-[#6C3BFF]" />
            <div>
              <p className="text-sm font-medium text-[#1C103D]">
                {stats.vipMembers > 0
                  ? `${stats.vipMembers} VIP clients driving revenue`
                  : "Build your VIP client base"}
              </p>
              <Link
                href="/clients/segments"
                className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#6C3BFF] hover:underline"
              >
                View segments
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </SidebarSection>
    </aside>
  );
}
