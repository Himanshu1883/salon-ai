import type { Metadata } from "next";
import PricingPage from "@/components/site/pages/pricing";

export const metadata: Metadata = {
  title: "Pricing — Gotix Plans From ₹599/mo",
  description:
    "Starter and Professional plans for salons. From ₹599/mo with 14-day free trial, no setup fee, and free data migration on Professional.",
};

export default function Page() {
  return <PricingPage />;
}
