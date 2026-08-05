import type { Metadata } from "next";
import PrivacyPageView from "@/components/site/pages/privacy";

export const metadata: Metadata = {
  title: "Privacy Policy — Gotix",
  description: "How Gotix collects, stores and protects salon and client data, and the choices available to you.",
};

export default function Page() {
  return <PrivacyPageView />;
}
