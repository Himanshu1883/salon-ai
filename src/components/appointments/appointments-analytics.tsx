"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarCheck,
  Clock,
  DollarSign,
  Percent,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import type { Appointment, Employee } from "./types";
import { computeTodayAnalytics } from "./appointments-utils";
import { cn } from "@/lib/utils";

type AppointmentsAnalyticsProps = {
  todayAppointments: Appointment[];
  employees: Employee[];
};

type StatCard = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  accent: string;
  iconBg: string;
};

export function AppointmentsAnalytics({
  todayAppointments,
  employees,
}: AppointmentsAnalyticsProps) {
  const stats = computeTodayAnalytics(todayAppointments, employees);

  const cards: StatCard[] = [
    {
      label: "Today's Appointments",
      value: stats.total,
      icon: <CalendarCheck className="h-5 w-5" />,
      trend: stats.total > 0 ? "+12%" : "—",
      trendUp: true,
      accent: "text-[#6C3BFF]",
      iconBg: "bg-[#EDE9FE]",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: <TrendingUp className="h-5 w-5" />,
      trend: stats.completed > 0 ? "+8%" : "—",
      trendUp: true,
      accent: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: <Clock className="h-5 w-5" />,
      trend: stats.pending > 0 ? "Active" : "Clear",
      trendUp: false,
      accent: "text-amber-600",
      iconBg: "bg-amber-50",
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      icon: <XCircle className="h-5 w-5" />,
      trend: stats.cancelled > 0 ? "Review" : "None",
      trendUp: false,
      accent: "text-red-500",
      iconBg: "bg-red-50",
    },
    {
      label: "Walk-ins",
      value: "—",
      icon: <UserCheck className="h-5 w-5" />,
      trend: "View queue",
      trendUp: true,
      accent: "text-[#FF2D6F]",
      iconBg: "bg-pink-50",
    },
    {
      label: "Revenue",
      value: stats.revenueEstimate > 0 ? `$${stats.revenueEstimate}` : "$0",
      icon: <DollarSign className="h-5 w-5" />,
      trend: stats.completed > 0 ? "Est." : "—",
      trendUp: true,
      accent: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      label: "Average Bill",
      value: stats.averageBill > 0 ? `$${stats.averageBill}` : "$0",
      icon: <DollarSign className="h-5 w-5" />,
      trend: "Est. $85",
      trendUp: true,
      accent: "text-[#6C3BFF]",
      iconBg: "bg-[#EDE9FE]",
    },
    {
      label: "Occupancy",
      value: `${stats.occupancy}%`,
      icon: <Percent className="h-5 w-5" />,
      trend: stats.occupancy > 70 ? "High" : "Room",
      trendUp: stats.occupancy > 50,
      accent: "text-[#6C3BFF]",
      iconBg: "bg-[#EDE9FE]",
    },
    {
      label: "Staff Utilization",
      value: `${stats.staffUtilization}%`,
      icon: <Users className="h-5 w-5" />,
      trend: `${stats.idleStaff.length} idle`,
      trendUp: stats.staffUtilization > 60,
      accent: "text-[#FF2D6F]",
      iconBg: "bg-pink-50",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#1C103D]">Today at a glance</h2>
        <Link
          href="/reports/appointments/by-period"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#6C3BFF] hover:underline"
        >
          View report
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="rounded-[20px] border border-[#E8ECF4] bg-white p-4 shadow-[0_4px_24px_rgba(28,16,61,0.05)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  card.iconBg,
                  card.accent
                )}
              >
                {card.icon}
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-[#1C103D]">
              {card.value}
            </p>
            <p className="mt-0.5 text-xs font-medium text-[#6B7280]">
              {card.label}
            </p>
            <p
              className={cn(
                "mt-1 text-[10px] font-medium",
                card.trendUp ? "text-emerald-600" : "text-[#9CA3AF]"
              )}
            >
              {card.trend}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
