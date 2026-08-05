import type { Metadata } from "next";
import PricingPage from "@/components/site/pages/pricing";

export const metadata: Metadata = {
  title: "Pricing — Gotix Plans From ₹1,999/mo",
  description: "Starter, Professional, Business and Enterprise plans for salons and chains. 14-day free trial, no setup fee, free data migration.",
};

export default function Page() {
  return <PricingPage />;
}
