import type { Metadata } from "next";
import TestimonialsPage from "@/components/site/pages/testimonials";

export const metadata: Metadata = {
  title: "Testimonials — Loved By Salons Across India | Gotix",
  description: "4.9★ from 847 reviews. Read how salon, spa and bridal studio owners run their business on Gotix.",
};

export default function Page() {
  return <TestimonialsPage />;
}
