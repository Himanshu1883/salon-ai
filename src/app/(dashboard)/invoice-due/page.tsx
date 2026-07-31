import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { signOutCallbackUrl } from "@/lib/salon-paths";
import { getInvoiceDuePageData } from "@/actions/subscription";
import { InvoiceDueClient } from "./invoice-due-client";

export default async function InvoiceDuePage() {
  const [data, session] = await Promise.all([
    getInvoiceDuePageData(),
    getAuthSession(),
  ]);

  if (data.shouldRedirect) {
    redirect("/dashboard");
  }

  return (
    <InvoiceDueClient
      overdueInvoice={data.overdueInvoice}
      subscription={data.subscription}
      signOutUrl={signOutCallbackUrl({ salonSlug: session?.user?.salonSlug })}
    />
  );
}
