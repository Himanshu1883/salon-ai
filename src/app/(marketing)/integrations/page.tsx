import type { Metadata } from "next";
import { IntegrationsPageContent } from "@/components/landing-v2/marketing/integrations/integrations-page";

export const metadata: Metadata = {
  title: "Integrations | Glow Desk ERP",
  description:
    "Connect WhatsApp, UPI, POS, inventory, and marketing tools with Glow Desk ERP.",
};

export default function IntegrationsPage() {
  return <IntegrationsPageContent />;
}
