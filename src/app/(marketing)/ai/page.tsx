import type { Metadata } from "next";
import AiPage from "@/components/site/pages/ai";

export const metadata: Metadata = {
  title: "AI Analytics for Salons — Gotix",
  description: "Demand forecasting, smart service recommendations, revenue optimization and inventory intelligence — AI that understands your salon.",
};

export default function Page() {
  return <AiPage />;
}
