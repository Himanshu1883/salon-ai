import { notFound } from "next/navigation";
import { getInvoice } from "@/actions/billing";
import { getWhatsAppSettingsAction } from "@/actions/whatsapp";
import { InvoicePrintView } from "./invoice-print-view";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [invoice, whatsappSettings] = await Promise.all([
    getInvoice(id),
    getWhatsAppSettingsAction(),
  ]);
  if (!invoice) notFound();

  return (
    <InvoicePrintView invoice={invoice} whatsappSettings={whatsappSettings} />
  );
}
