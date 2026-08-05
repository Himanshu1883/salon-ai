import type { Metadata } from "next";
import ModulesPage from "@/components/site/pages/modules";

export const metadata: Metadata = {
  title: "22+ Salon ERP Modules — Gotix",
  description: "Explore all Gotix modules: appointments, POS, billing, inventory, CRM, staff, payroll, marketing, WhatsApp, reports and analytics.",
};

export default function Page() {
  return <ModulesPage />;
}
