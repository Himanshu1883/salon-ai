"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  ListOrdered,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getInitials } from "./utils";
import type { RecentCustomerItem } from "./types";

type CheckInHeaderProps = {
  recentCustomers: RecentCustomerItem[];
  onSelectRecent: (customer: RecentCustomerItem) => void;
  queueCount?: number;
  selectedServicesCount?: number;
};

const STEPS = [
  { label: "Customer", short: "1" },
  { label: "Services", short: "2" },
  { label: "Stylist", short: "3" },
  { label: "Queue", short: "4" },
];

export function CheckInHeader({
  recentCustomers,
  onSelectRecent,
  queueCount = 0,
  selectedServicesCount = 0,
}: CheckInHeaderProps) {
  const activeStep =
    selectedServicesCount > 0 ? 3 : selectedServicesCount === 0 ? 1 : 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="overflow-hidden rounded-[20px] border border-dashboard-border bg-dashboard-card/95 shadow-dashboard-card backdrop-blur-sm"
    >
      <div className="bg-gradient-to-br from-violet-600/8 via-dashboard-card to-dashboard-card px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-dashboard-primary to-violet-500 shadow-lg shadow-violet-500/30 sm:h-12 sm:w-12">
              <UserRound className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-dashboard-text sm:text-3xl">
                Customer Check-in
              </h1>
              <p className="mt-1 max-w-xl text-xs text-dashboard-muted sm:text-base">
                Register walk-ins and add them to today&apos;s queue in seconds.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <Button
              asChild
              variant="outline"
              className="h-10 min-w-0 flex-1 rounded-xl border-dashboard-border bg-white/80 px-3 shadow-sm backdrop-blur-sm hover:border-violet-300 hover:bg-violet-50/80 sm:flex-none sm:px-3.5"
            >
              <Link href="/queue">
                <ListOrdered className="h-4 w-4 text-dashboard-primary" />
                <span className="sm:hidden">Queue</span>
                <span className="hidden sm:inline">Live Queue</span>
                {queueCount > 0 && (
                  <Badge className="ml-1.5 border-0 bg-dashboard-primary px-2 py-0 text-[10px] text-white">
                    {queueCount}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="hidden h-10 rounded-xl border-dashboard-border bg-white/80 px-3.5 shadow-sm backdrop-blur-sm hover:border-violet-300 hover:bg-violet-50/80 sm:inline-flex"
              onClick={() => {
                /* UI stub — AI queue suggestion */
              }}
            >
              <Sparkles className="h-4 w-4 text-dashboard-primary" />
              AI Suggest
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 min-w-0 flex-1 rounded-xl border-dashboard-border bg-white/80 px-3 shadow-sm backdrop-blur-sm hover:border-violet-300 hover:bg-violet-50/80 sm:flex-none sm:px-3.5"
                >
                  <Clock className="h-4 w-4 text-dashboard-muted" />
                  Recent
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85dvh] w-[calc(100vw-1.5rem)] max-w-lg overflow-y-auto rounded-[20px] border-dashboard-border bg-dashboard-card/98 shadow-2xl backdrop-blur-md">
                <DialogHeader>
                  <DialogTitle className="text-dashboard-text">
                    Recent walk-ins
                  </DialogTitle>
                </DialogHeader>
                {recentCustomers.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-center">
                    <Users className="mb-3 h-10 w-10 text-dashboard-muted/40" />
                    <p className="text-sm text-dashboard-muted">
                      No recent customers yet.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                    {recentCustomers.map((customer, index) => (
                      <motion.button
                        key={customer.id}
                        type="button"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        onClick={() => onSelectRecent(customer)}
                        className="flex w-full items-center gap-3 rounded-xl border border-transparent bg-violet-50/60 p-3 text-left transition-all hover:border-violet-200 hover:bg-violet-50 hover:shadow-sm"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-dashboard-primary to-violet-500 text-xs font-bold text-white shadow-sm">
                          {getInitials(customer.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-dashboard-text">
                            {customer.name}
                          </p>
                          <p className="text-xs text-dashboard-muted">
                            {[customer.phone, customer.email]
                              .filter(Boolean)
                              .join(" · ") || "No contact info"}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-dashboard-muted/70">
                          {format(new Date(customer.createdAt), "MMM d")}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                )}
                <Button
                  variant="outline"
                  asChild
                  className="w-full rounded-xl border-dashboard-border"
                >
                  <Link href="/customers">View all customers</Link>
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Step progress */}
        <div
          className="mt-4 flex items-center overflow-x-auto pb-0.5 sm:mt-5"
          aria-label="Check-in progress"
        >
          {STEPS.map((step, i) => {
            const stepNum = i + 1;
            const isActive = stepNum <= activeStep;
            const isCurrent = stepNum === activeStep;
            return (
              <div key={step.label} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                      isActive
                        ? "bg-gradient-to-br from-dashboard-primary to-violet-500 text-white shadow-md shadow-violet-500/25"
                        : "border border-violet-200 bg-white/80 text-violet-400"
                    )}
                  >
                    {step.short}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-medium transition-colors sm:text-xs",
                      isCurrent
                        ? "text-dashboard-primary"
                        : isActive
                          ? "text-dashboard-text"
                          : "text-dashboard-muted"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 w-4 shrink-0 rounded-full transition-colors duration-300 sm:mx-3 sm:w-8 lg:w-12",
                      stepNum < activeStep ? "bg-violet-400" : "bg-violet-100"
                    )}
                    aria-hidden
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
