"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  Bell,
  Calendar,
  ChevronDown,
  Plus,
  MessageSquare,
  Sun,
  GitBranch,
  LogOut,
  CreditCard,
  Building2,
  Receipt,
  MoreHorizontal,
} from "lucide-react";
import { DashboardSearch } from "@/components/dashboard/dashboard-search";
import { signOut } from "next-auth/react";
import { signOutCallbackUrl } from "@/lib/salon-paths";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getRoleLabel } from "@/lib/team";
import { usePlan } from "@/components/plans/plan-provider";
import { useRecordSale } from "@/components/dashboard/record-sale-provider";
import { SalonLogoMark } from "@/components/salon/salon-logo-mark";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

type DashboardHeaderProps = {
  userName: string;
  salonName: string;
  salonSlug?: string;
  salonLogoUrl?: string | null;
  userRole?: string;
  showSettings?: boolean;
  alertBadge?: React.ReactNode;
  accessBlocked?: boolean;
  canViewCustomers?: boolean;
};

export function DashboardHeader({
  userName,
  salonName,
  salonSlug,
  salonLogoUrl = null,
  userRole = "owner",
  showSettings = false,
  alertBadge = null,
  accessBlocked = false,
  canViewCustomers = true,
}: DashboardHeaderProps) {
  const { isEnterprise } = usePlan();
  const { openRecordSale } = useRecordSale();
  const firstName = userName.split(" ")[0] ?? "there";
  const today = format(new Date(), "EEEE, MMMM d, yyyy");
  const roleLabel =
    userRole === "owner"
      ? "Owner"
      : getRoleLabel(userRole).replace("Workspace owner", "Owner");

  return (
    <header className="relative sticky top-0 z-30 hidden border-b border-dashboard-border font-[family-name:var(--font-inter)] shadow-[0_8px_30px_-18px_rgba(91,33,182,0.35)] lg:block">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <Image
          src="/git.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/88 via-white/78 to-[#F5F3FF]/70" />
        <div className="absolute inset-0 bg-[#5B21B6]/[0.06]" />
        <div className="absolute inset-0 backdrop-blur-[1.5px]" />
      </div>

      <div className="relative z-10 px-4 py-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-center gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,420px)_minmax(0,1fr)]">
        <div className="min-w-0">
          <h1 className="text-lg font-bold tracking-tight text-dashboard-text sm:text-xl xl:text-2xl">
            <span className="bg-gradient-to-r from-[#5B21B6] to-[#4F46E5] bg-clip-text text-transparent">
              {getGreeting()}, {firstName}
            </span>{" "}
            <span aria-hidden>👋</span>
          </h1>
          <p className="mt-0.5 truncate text-sm font-medium text-dashboard-primary">
            {salonName}
          </p>
          <p className="mt-0.5 text-xs text-dashboard-muted sm:text-sm">{today}</p>
        </div>

        {!accessBlocked && (
          <DashboardSearch className="xl:mx-auto xl:max-w-[420px]" />
        )}

        <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-2.5 xl:justify-end">
          {!accessBlocked && (
            <>
              <Button
                asChild
                variant="outline"
                size="icon"
                className="relative h-10 w-10 shrink-0 rounded-2xl border-dashboard-border bg-white shadow-sm"
              >
                <Link href="/dashboard" aria-label="Notifications">
                  <Bell className="h-4 w-4 text-dashboard-muted" />
                  {alertBadge}
                </Link>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-2xl border-dashboard-border bg-white shadow-sm xl:hidden"
                aria-label="Messages"
                onClick={() => {}}
              >
                <MessageSquare className="h-4 w-4 text-dashboard-muted" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-2xl border-dashboard-border bg-white shadow-sm xl:hidden"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4 text-dashboard-muted" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-2xl">
                  <DropdownMenuItem onClick={() => {}}>
                    <Sun className="h-4 w-4" />
                    Toggle theme
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}}>
                    <GitBranch className="h-4 w-4" />
                    Switch branch
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}}>
                    <MessageSquare className="h-4 w-4" />
                    Messages
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="hidden h-10 w-10 shrink-0 rounded-2xl border-dashboard-border bg-white shadow-sm xl:inline-flex"
                aria-label="Toggle theme"
                onClick={() => {}}
              >
                <Sun className="h-4 w-4 text-dashboard-muted" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="hidden h-10 w-10 shrink-0 rounded-2xl border-dashboard-border bg-white shadow-sm xl:inline-flex"
                aria-label="Switch branch"
                onClick={() => {}}
              >
                <GitBranch className="h-4 w-4 text-dashboard-muted" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="hidden h-10 w-10 shrink-0 rounded-2xl border-dashboard-border bg-white shadow-sm xl:inline-flex"
                aria-label="Messages"
                onClick={() => {}}
              >
                <MessageSquare className="h-4 w-4 text-dashboard-muted" />
              </Button>

              <div className="inline-flex h-10 overflow-hidden rounded-2xl shadow-sm">
                <Button
                  asChild
                  className="h-10 rounded-none rounded-l-2xl bg-dashboard-primary px-3 hover:bg-dashboard-primary-hover sm:px-4"
                >
                  <Link href="/sales/appointments">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Quick Add</span>
                    <span className="sm:hidden">Add</span>
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      className="h-10 rounded-none rounded-r-2xl border-l border-violet-500/40 bg-dashboard-primary px-2.5 hover:bg-dashboard-primary-hover"
                      aria-label="More quick add options"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-2xl">
                    <DropdownMenuItem asChild>
                      <Link href="/sales/appointments">
                        <Calendar className="h-4 w-4" />
                        Book appointment
                      </Link>
                    </DropdownMenuItem>
                    {isEnterprise && (
                      <DropdownMenuItem asChild>
                        <Link href="/check-in">Walk-in check-in</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onSelect={() => openRecordSale()}>
                      <Receipt className="h-4 w-4" />
                      Record sale
                    </DropdownMenuItem>
                    {canViewCustomers ? (
                    <DropdownMenuItem asChild>
                      <Link href="/clients">Add customer</Link>
                    </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 items-center gap-2 rounded-2xl border border-dashboard-border bg-white px-2 shadow-sm transition-colors hover:bg-dashboard-bg sm:pl-2 sm:pr-3"
                  >
                    <SalonLogoMark
                      logoUrl={salonLogoUrl}
                      fallbackInitial={userName}
                      size="xs"
                      variant="dark"
                      alt={`${salonName} logo`}
                    />
                    <span className="hidden max-w-[100px] truncate text-sm font-medium text-dashboard-text lg:inline">
                      {firstName}
                    </span>
                    <ChevronDown className="hidden h-4 w-4 text-dashboard-muted lg:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-dashboard-text">{userName}</p>
                    <p className="text-xs text-dashboard-muted">{roleLabel}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {showSettings && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/settings/salon">
                          <Building2 className="h-4 w-4" />
                          Salon profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings/billing">
                          <CreditCard className="h-4 w-4" />
                          Billing
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={() =>
                      signOut({
                        callbackUrl: signOutCallbackUrl({ salonSlug }),
                      })
                    }
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
      </div>
    </header>
  );
}
