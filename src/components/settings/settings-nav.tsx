import Link from "next/link";
import { cn } from "@/lib/utils";
import { CreditCard, Building2, Bell, Crown, MessageCircle } from "lucide-react";
import { isBasicPlan, type SalonPlan } from "@/lib/plans";

const settingsLinks = [
  {
    href: "/settings/subscription",
    label: "Plan & subscription",
    icon: Crown,
    ownerOnly: true,
  },
  {
    href: "/settings/billing",
    label: "Platform billing",
    icon: CreditCard,
    ownerOnly: true,
  },
  {
    href: "/settings/salon",
    label: "Salon profile",
    icon: Building2,
    ownerOnly: true,
  },
  {
    href: "/settings/whatsapp",
    label: "WhatsApp messages",
    icon: MessageCircle,
    ownerOnly: true,
  },
  {
    href: "/settings/notifications",
    label: "Notifications",
    icon: Bell,
    ownerOnly: false,
    enterpriseOnly: true,
  },
];

function isSettingsActive(pathname: string, href: string) {
  if (
    href === "/settings/billing" ||
    href === "/settings/salon" ||
    href === "/settings/subscription" ||
    href === "/settings/whatsapp"
  ) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SettingsNav({
  pathname,
  showOwnerSettings = true,
  plan = "ENTERPRISE",
}: {
  pathname: string;
  showOwnerSettings?: boolean;
  plan?: SalonPlan;
}) {
  const links = settingsLinks.filter((link) => {
    if (!showOwnerSettings && link.ownerOnly) return false;
    if (isBasicPlan(plan) && link.enterpriseOnly) return false;
    return true;
  });

  return (
    <nav className="mb-6 flex flex-wrap gap-2 border-b border-stone-200 pb-4">
      {links.map((link) => {
        const Icon = link.icon;
        const active = isSettingsActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-violet-50 text-violet-700"
                : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
