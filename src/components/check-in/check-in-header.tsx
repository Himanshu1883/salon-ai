"use client";

import Link from "next/link";
import { Clock, ListOrdered, Sparkles, UserRound } from "lucide-react";
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
import type { RecentCustomerItem } from "./types";

type CheckInHeaderProps = {
  recentCustomers: RecentCustomerItem[];
  onSelectRecent: (customer: RecentCustomerItem) => void;
  queueCount?: number;
};

export function CheckInHeader({
  recentCustomers,
  onSelectRecent,
  queueCount = 0,
}: CheckInHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C3BFF] to-[#8B5CF6] shadow-lg shadow-[#6C3BFF]/20">
          <UserRound className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C103D] sm:text-3xl">
            Customer Check-in
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[#6B7280] sm:text-base">
            Register walk-in customers and instantly add them to today&apos;s queue.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          asChild
          variant="outline"
          className="h-11 rounded-2xl border-[#6C3BFF]/25 bg-white px-4 shadow-sm hover:border-[#6C3BFF]/50 hover:bg-[#EDE9FE]/50"
        >
          <Link href="/queue">
            <ListOrdered className="h-4 w-4 text-[#6C3BFF]" />
            Live Queue
            {queueCount > 0 && (
              <Badge className="ml-1 border-0 bg-[#6C3BFF] px-2 py-0 text-[10px] text-white">
                {queueCount}
              </Badge>
            )}
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-2xl border-[#E5E7EB] bg-white px-4 shadow-sm hover:border-[#6C3BFF]/30 hover:bg-[#F7F8FC]"
          onClick={() => {
            /* UI stub — AI queue suggestion */
          }}
        >
          <Sparkles className="h-4 w-4 text-[#6C3BFF]" />
          AI Queue Suggestion
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl border-[#E5E7EB] bg-white px-4 shadow-sm hover:border-[#6C3BFF]/30 hover:bg-[#F7F8FC]"
            >
              <Clock className="h-4 w-4 text-[#6B7280]" />
              Recent Walk-ins
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[20px] border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle>Recent walk-ins</DialogTitle>
            </DialogHeader>
            {recentCustomers.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#6B7280]">
                No recent customers yet.
              </p>
            ) : (
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {recentCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => onSelectRecent(customer)}
                    className="flex w-full items-center gap-3 rounded-xl bg-[#F7F8FC] p-3 text-left transition-all hover:bg-[#EDE9FE]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6C3BFF] to-[#FF2D6F] text-xs font-bold text-white">
                      {customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-[#1C103D]">
                        {customer.name}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {[customer.phone, customer.email]
                          .filter(Boolean)
                          .join(" · ") || "No contact info"}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-[#9CA3AF]">
                      {format(new Date(customer.createdAt), "MMM d")}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <Button variant="outline" asChild className="w-full rounded-xl">
              <Link href="/customers">View all customers</Link>
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
