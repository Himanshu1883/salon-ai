import type { Metadata } from "next";
import HomePageView from "@/components/site/pages/home";

export const metadata: Metadata = {
  title: "Gotix — AI-Powered Salon CRM & ERP Software",
  description: "Appointments, POS billing, inventory, CRM and AI analytics in one intelligent platform built for salons, spas and beauty chains.",
};

export default function Page() {
  return <HomePageView />;
}
