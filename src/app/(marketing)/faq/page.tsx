import type { Metadata } from "next";
import FaqPage from "@/components/site/pages/faq";

export const metadata: Metadata = {
  title: "FAQ — Setup, Migration & Billing | Gotix",
  description: "Answers on setup time, multi-branch support, data migration, WhatsApp integration, free trials and POS payment methods.",
};

export default function Page() {
  return <FaqPage />;
}
