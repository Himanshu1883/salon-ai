import type { Metadata } from "next";
import { AboutPageContent } from "@/components/landing-v2/marketing/about/about-page";

export const metadata: Metadata = {
  title: "About Us | Salon AI ERP",
  description:
    "Learn about Salon AI — the luxury AI-powered salon ERP trusted by 1,000+ salons across India.",
};

export default function AboutPage() {
  return <AboutPageContent />;
}
