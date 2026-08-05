import type { Metadata } from "next";
import PlatformPage from "@/components/site/pages/platform";

export const metadata: Metadata = {
  title: "Platform Preview — Inside Gotix",
  description: "Take an interactive tour of the Gotix platform: dashboard, scheduling, billing, CRM, inventory, marketing, reports and AI analytics.",
};

export default function Page() {
  return <PlatformPage />;
}
