import type { Metadata } from "next";
import TermsPageView from "@/components/site/pages/terms";

export const metadata: Metadata = {
  title: "Terms of Service — Gotix",
  description: "The terms that govern use of the Gotix platform, subscriptions, trials and acceptable use.",
};

export default function Page() {
  return <TermsPageView />;
}
