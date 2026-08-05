import type { Metadata } from "next";
import DemoPage from "@/components/site/pages/demo";

export const metadata: Metadata = {
  title: "Book a Demo — Gotix",
  description: "Book a 30-minute guided walkthrough of Gotix tailored to your salon, spa or chain.",
};

export default function Page() {
  return <DemoPage />;
}
