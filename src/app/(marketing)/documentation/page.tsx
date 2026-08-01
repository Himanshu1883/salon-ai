import type { Metadata } from "next";
import { DocsPageContent } from "@/components/landing-v2/marketing/docs/docs-page";

export const metadata: Metadata = {
  title: "Documentation | Glow Desk ERP",
  description:
    "Getting started guides, module overview, and onboarding help for Glow Desk ERP.",
};

export default function DocumentationPage() {
  return <DocsPageContent />;
}
