import type { Metadata } from "next";
import { PricingPageContent } from "@/components/landing-v2/marketing/pricing/pricing-page";

export const metadata: Metadata = {
  title: "Pricing | Salon AI ERP",
  description:
    "Flexible Salon AI plans for every salon size — Starter, Professional, Business, and Enterprise. 14-day free trial.",
};

export default function PricingPage() {
  return <PricingPageContent />;
}
