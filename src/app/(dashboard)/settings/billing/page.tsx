import { getBillingPageData } from "@/actions/subscription";
import { canAccessSettings } from "@/actions/salon";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BillingClient } from "./billing-client";

export default async function BillingSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const allowed = await canAccessSettings(session.user.id);
  if (!allowed) redirect("/dashboard");

  const data = await getBillingPageData();
  return <BillingClient {...data} />;
}
