"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { signOutCallbackUrl } from "@/lib/salon-paths";
import { LayoutDashboard, Building2, LogOut, Shield, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/salons", label: "Salons", icon: Building2 },
];

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800/50 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="border-b border-slate-800/60 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-dashboard-primary to-dashboard-secondary shadow-lg shadow-violet-500/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-white">Salon AI</p>
            <p className="text-xs font-medium text-slate-400">Platform Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Navigation
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-dashboard-primary/15 text-white ring-1 ring-dashboard-primary/30"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active ? "text-dashboard-secondary" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 text-dashboard-secondary" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800/60 p-4">
        <div className="mb-3 rounded-xl bg-slate-800/40 px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Signed in as
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-slate-200">{userName}</p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
          onClick={() =>
            signOut({
              callbackUrl: signOutCallbackUrl({ isSuperAdmin: true }),
            })
          }
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
