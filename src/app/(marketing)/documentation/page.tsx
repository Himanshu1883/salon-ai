import type { Metadata } from "next";
import { DocsPageContent } from "@/components/landing-v2/marketing/docs/docs-page";

export const metadata: Metadata = {
  title: "Documentation | Salon AI ERP",
  description:
    "Getting started guides, module overview, and onboarding help for Salon AI ERP.",
};

export default function DocumentationPage() {
  return <DocsPageContent />;
}
