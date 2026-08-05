import type { Metadata } from "next";
import AboutPage from "@/components/site/pages/about";

export const metadata: Metadata = {
  title: "About Gotix — Built by People Who Understand Salons",
  description: "Our mission: give every salon, spa and beauty chain the operational intelligence of an enterprise brand.",
};

export default function Page() {
  return <AboutPage />;
}
