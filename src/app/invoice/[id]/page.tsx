import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicInvoice } from "@/lib/billing/public-invoice";
import { InvoicePrintView } from "@/app/(dashboard)/billing/[id]/invoice-print-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const invoice = await getPublicInvoice(id);
  if (!invoice) return { title: "Invoice" };
  return { title: `Invoice · ${invoice.salon.name}` };
}

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getPublicInvoice(id);
  if (!invoice) notFound();

  return (
    <div className="min-h-screen bg-[#F3F4F6] px-4 py-8 print:bg-white print:px-0 print:py-0">
      <InvoicePrintView invoice={invoice} variant="public" />
    </div>
  );
}
