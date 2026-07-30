import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { LandingPageV2 } from "@/components/landing-v2";

export const metadata: Metadata = {
  title: "Salon AI ERP | AI-Powered Salon Management Platform",
  description:
    "Enterprise salon ERP with 26+ modules — appointments, billing, POS, inventory, CRM, marketing, WhatsApp automation, staff management, and AI analytics. Trusted by 1,000+ salons.",
  keywords: [
    "salon ERP",
    "salon management software",
    "salon AI",
    "salon POS system",
    "salon booking software",
    "salon CRM",
    "multi branch salon software",
    "salon inventory management",
    "salon billing software India",
  ],
  openGraph: {
    title: "Salon AI ERP | Run Your Entire Salon with AI",
    description:
      "Enterprise-grade salon ERP platform with AI analytics, POS billing, CRM, inventory, WhatsApp automation, and multi-branch management.",
    type: "website",
    siteName: "Salon AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Salon AI ERP | AI-Powered Salon Management",
    description:
      "26+ integrated modules for modern salon businesses. Start your free trial today.",
  },
};

export default async function HomePage() {
  const session = await auth();
  return <LandingPageV2 isAuthenticated={!!session} />;
}
