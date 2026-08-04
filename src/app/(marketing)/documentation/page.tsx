import type { Metadata } from "next";
import { DocsPageContent } from "@/components/landing-v2/marketing/docs/docs-page";

export const metadata: Metadata = {
  title: "Documentation | Go Tix",
  description:
    "Getting started guides, module overview, and onboarding help for Go Tix.",
};

export default function DocumentationPage() {
  return <DocsPageContent />;
}
