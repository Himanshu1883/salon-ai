"use client";

import { useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatInvoiceNumber } from "@/components/billing/invoice-modal/utils";
import { resolveLineItemLabel } from "@/lib/service-display";
import {
  WhatsAppCommunicationDrawer,
  type WhatsAppInvoiceContext,
} from "@/components/billing/whatsapp-communication";

type InvoiceWhatsAppActionsProps = {
  invoice: {
    id: string;
    customerName: string;
    customerPhone: string | null;
    total: number;
    paymentMethod: string | null;
    paidAt: Date | null;
    createdAt: Date;
    salon: { name: string };
    employee: { name: string } | null;
    lineItems: {
      description: string;
      service?: { name: string } | null;
    }[];
  };
  billingMessageTemplate: string;
};

export function InvoiceWhatsAppActions({
  invoice,
  billingMessageTemplate,
}: InvoiceWhatsAppActionsProps) {
  const [open, setOpen] = useState(false);

  const context = useMemo((): WhatsAppInvoiceContext => {
    const services = invoice.lineItems
      .map((item) =>
        resolveLineItemLabel({
          serviceName: item.service?.name,
          description: item.description,
        })
      )
      .filter(Boolean)
      .join(", ");

    return {
      invoiceId: invoice.id,
      invoiceNumber: formatInvoiceNumber(invoice.id, new Date(invoice.createdAt)),
      customerName: invoice.customerName,
      customerPhone: invoice.customerPhone ?? "",
      amount: invoice.total,
      paymentMethod: invoice.paymentMethod ?? "pending",
      paidAt: invoice.paidAt ? new Date(invoice.paidAt) : new Date(invoice.createdAt),
      staffName: invoice.employee?.name ?? "Staff",
      salonName: invoice.salon.name,
      services: services || "—",
    };
  }, [invoice]);

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-[#25D366] hover:bg-[#1EBE5A]"
      >
        <MessageCircle className="h-4 w-4" />
        Send on WhatsApp
      </Button>
      <WhatsAppCommunicationDrawer
        open={open}
        onClose={() => setOpen(false)}
        context={context}
        billingMessageTemplate={billingMessageTemplate}
      />
    </>
  );
}
