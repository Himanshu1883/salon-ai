import type { Metadata } from "next";
import SecurityPageView from "@/components/site/pages/security";

export const metadata: Metadata = {
  title: "Security — Gotix",
  description: "Encryption, access control, backups and compliance practices that protect your salon and client data.",
};

export default function Page() {
  return <SecurityPageView />;
}
