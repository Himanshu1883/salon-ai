import type { Metadata } from "next";
import { IntegrationsPageContent } from "@/components/landing-v2/marketing/integrations/integrations-page";

export const metadata: Metadata = {
  title: "Integrations | Go Tix",
  description:
    "Connect WhatsApp, UPI, POS, inventory, and marketing tools with Go Tix.",
};

export default function IntegrationsPage() {
  return <IntegrationsPageContent />;
}
