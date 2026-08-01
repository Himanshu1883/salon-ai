"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  ClipboardList,
  CreditCard,
  FileText,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Receipt,
  Trash2,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { CustomerListItem } from "@/actions/customers";
import { usePlan } from "@/components/plans/plan-provider";
import { getClientDetailPath } from "./clients-utils";

type ClientsRowActionsProps = {
  customer: CustomerListItem;
  onActionClick?: (e: React.MouseEvent) => void;
};

export function ClientsRowActions({
  customer,
  onActionClick,
}: ClientsRowActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isEnterprise } = usePlan();
  const profilePath = getClientDetailPath(pathname, customer.id);

  function handleClick(e: React.MouseEvent, action: () => void) {
    e.stopPropagation();
    onActionClick?.(e);
    action();
  }

  const appointmentUrl = `/sales/appointments?customerId=${customer.id}&name=${encodeURIComponent(customer.name)}${customer.phone ? `&phone=${encodeURIComponent(customer.phone)}` : ""}`;
  const checkInUrl = `/check-in?customerId=${customer.id}&name=${encodeURIComponent(customer.name)}${customer.phone ? `&phone=${encodeURIComponent(customer.phone)}` : ""}`;
  const billingUrl = `/billing?customerName=${encodeURIComponent(customer.name)}${customer.phone ? `&customerPhone=${encodeURIComponent(customer.phone)}` : ""}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 rounded-lg p-0 hover:bg-[#F7F8FC]"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4 text-[#6B7280]" />
          <span className="sr-only">Actions for {customer.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-xl">
        <DropdownMenuItem
          onClick={(e) => handleClick(e, () => router.push(profilePath))}
        >
          <User className="h-4 w-4" />
          Open Profile
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={appointmentUrl} onClick={(e) => e.stopPropagation()}>
            <Calendar className="h-4 w-4" />
            Book Appointment
          </Link>
        </DropdownMenuItem>
        {isEnterprise && (
          <DropdownMenuItem asChild>
            <Link href={checkInUrl} onClick={(e) => e.stopPropagation()}>
              <ClipboardList className="h-4 w-4" />
              Check In
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={billingUrl} onClick={(e) => e.stopPropagation()}>
            <Receipt className="h-4 w-4" />
            Create Invoice
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <CreditCard className="h-4 w-4" />
          Membership
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!customer.phone}
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!customer.phone}>
          <Phone className="h-4 w-4" />
          SMS
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!customer.email}>
          <Mail className="h-4 w-4" />
          Email
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => handleClick(e, () => router.push(profilePath))}
        >
          <FileText className="h-4 w-4" />
          Notes
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-red-600 focus:text-red-600">
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
