import { redirect } from "next/navigation";
import { getInvoiceDuePageData } from "@/actions/subscription";
import { InvoiceDueClient } from "./invoice-due-client";

export default async function InvoiceDuePage() {
  const data = await getInvoiceDuePageData();

  if (data.shouldRedirect) {
    redirect("/dashboard");
  }

  return (
    <InvoiceDueClient
      overdueInvoice={data.overdueInvoice}
      subscription={data.subscription}
    />
  );
}
