import type { Metadata } from "next";
import FeaturesPage from "@/components/site/pages/features";

export const metadata: Metadata = {
  title: "Features — Five-Star Salon Operations | Gotix",
  description: "Reception, POS, inventory, stylist workflow, treatment tracking, spa management and AI consultations — every Gotix feature explained.",
};

export default function Page() {
  return <FeaturesPage />;
}
