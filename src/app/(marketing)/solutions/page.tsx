import type { Metadata } from "next";
import SolutionsPage from "@/components/site/pages/solutions";

export const metadata: Metadata = {
  title: "Solutions by Salon Type — Gotix",
  description: "Gotix is tailored for hair salons, spas, skin clinics, barber shops, nail and makeup studios, academies, bridal and tattoo studios.",
};

export default function Page() {
  return <SolutionsPage />;
}
