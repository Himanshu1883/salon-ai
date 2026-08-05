import type { Metadata } from "next";
import ContactPage from "@/components/site/pages/contact";

export const metadata: Metadata = {
  title: "Contact Gotix — Talk to Our Team",
  description: "Get in touch with the Gotix team for demos, migration help, pricing questions or partnership enquiries.",
};

export default function Page() {
  return <ContactPage />;
}
