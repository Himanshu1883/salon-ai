"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";
import {
  MembershipPageHeader,
  MembershipStatCard,
} from "@/components/memberships/memberships-shell";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Crown, Users, Clock, Wallet, TrendingUp, Plus } from "lucide-react";
import { MEMBERSHIP_PRIMARY } from "@/lib/memberships/constants";

type DashboardProps = {
  stats: {
    activeCount: number;
    expiringSoon: number;
    monthRevenue: number;
    totalMembers: number;
    walletBalance: number;
    planChart: { name: string; value: number; color: string }[];
    revenueChart: { month: string; revenue: number }[];
    recentTransactions: {
      id: string;
      type: string;
      amount: number;
      customerName: string;
      createdAt: Date;
      description: string | null;
    }[];
  };
};

export function MembershipDashboardClient({ stats }: DashboardProps) {
  return (
    <div className="space-y-6">
      <MembershipPageHeader
        title="Membership Dashboard"
        description="Track memberships, revenue, and loyalty at a glance."
      >
        <Button
          asChild
          className="rounded-xl text-white hover:opacity-90"
          style={{ backgroundColor: MEMBERSHIP_PRIMARY }}
        >
          <Link href="/memberships/sell">
            <Plus className="mr-2 h-4 w-4" />
            Sell Membership
          </Link>
        </Button>
      </MembershipPageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MembershipStatCard
          label="Active Members"
          value={stats.activeCount}
          sub={`${stats.totalMembers} total`}
          accent="green"
        />
        <MembershipStatCard
          label="Expiring Soon"
          value={stats.expiringSoon}
          sub="Next 30 days"
          accent="gold"
        />
        <MembershipStatCard
          label="Month Revenue"
          value={formatCurrency(stats.monthRevenue)}
          accent="emerald"
        />
        <MembershipStatCard
          label="Wallet Balance"
          value={formatCurrency(stats.walletBalance)}
          sub="Total client wallets"
          accent="slate"
        />
        <MembershipStatCard
          label="Retention"
          value={
            stats.totalMembers > 0
              ? `${Math.round((stats.activeCount / stats.totalMembers) * 100)}%`
              : "—"
          }
          sub="Active / total"
          accent="green"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"
        >
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-stone-900 dark:text-white">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Membership Revenue
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(v) => formatCurrency(Number(v))}
                  contentStyle={{ borderRadius: 12 }}
                />
                <Bar dataKey="revenue" fill={MEMBERSHIP_PRIMARY} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"
        >
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-stone-900 dark:text-white">
            <Crown className="h-4 w-4 text-amber-500" />
            Plan Distribution
          </h3>
          <div className="h-64">
            {stats.planChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.planChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {stats.planChart.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-stone-500">
                No active memberships yet
              </div>
            )}
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {stats.planChart.map((p) => (
              <span key={p.name} className="flex items-center gap-1.5 text-xs">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                {p.name} ({p.value})
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900"
      >
        <div className="border-b border-stone-100 px-5 py-4 dark:border-stone-800">
          <h3 className="font-semibold text-stone-900 dark:text-white">
            Recent Transactions
          </h3>
        </div>
        {stats.recentTransactions.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-stone-500">
            No membership transactions yet.{" "}
            <Link href="/memberships/sell" className="text-emerald-600 hover:underline">
              Sell your first membership
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {stats.recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900 dark:text-white">
                      {tx.customerName}
                    </p>
                    <p className="text-xs text-stone-500">
                      {tx.description ?? tx.type} ·{" "}
                      {format(new Date(tx.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
                <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/memberships/plans"
          className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
        >
          <Crown className="h-5 w-5 text-emerald-600" />
          <p className="mt-2 font-semibold text-stone-900 group-hover:text-emerald-700 dark:text-white">
            Manage Plans
          </p>
          <p className="text-xs text-stone-500">Build & edit membership tiers</p>
        </Link>
        <Link
          href="/memberships/active"
          className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
        >
          <Clock className="h-5 w-5 text-amber-500" />
          <p className="mt-2 font-semibold text-stone-900 group-hover:text-emerald-700 dark:text-white">
            Active Memberships
          </p>
          <p className="text-xs text-stone-500">{stats.activeCount} active now</p>
        </Link>
        <Link
          href="/memberships/wallet"
          className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
        >
          <Wallet className="h-5 w-5 text-teal-600" />
          <p className="mt-2 font-semibold text-stone-900 group-hover:text-emerald-700 dark:text-white">
            Wallet & Loyalty
          </p>
          <p className="text-xs text-stone-500">Manage balances & points</p>
        </Link>
      </div>
    </div>
  );
}
