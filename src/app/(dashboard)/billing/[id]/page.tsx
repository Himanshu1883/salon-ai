import { notFound } from "next/navigation";
import { getInvoice } from "@/actions/billing";
import { InvoicePrintView } from "./invoice-print-view";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  return <InvoicePrintView invoice={invoice} />;
}
