import type { Metadata } from "next";
import { AboutPageContent } from "@/components/landing-v2/marketing/about/about-page";

export const metadata: Metadata = {
  title: "About Us | Go Tix",
  description:
    "Learn about Go Tix — the luxury AI-powered salon ERP trusted by 1,000+ salons across India.",
};

export default function AboutPage() {
  return <AboutPageContent />;
}
