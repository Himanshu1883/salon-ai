import { LegalPage } from "@/components/site/LegalPage";

const TITLE = "Privacy Policy — Gotix";
const DESC =
  "How Gotix collects, stores and protects salon and client data, and the choices available to you.";

export default function PrivacyPageView() {
  return (

    <LegalPage
      title="Privacy Policy"
      intro="We collect only the data needed to run your salon software, and we never sell it."
      sections={[
        {
          heading: "Data we collect",
          body: "Account details, salon configuration, appointment and billing records you create, and basic product usage analytics.",
        },
        {
          heading: "How we use it",
          body: "To operate your workspace, deliver reminders you configure, provide support, and improve product reliability.",
        },
        {
          heading: "Client data ownership",
          body: "Your client records remain yours. You can export or request deletion at any time from workspace settings.",
        },
        {
          heading: "Cookies",
          body: "We use essential cookies for session handling and privacy-friendly analytics to understand feature usage.",
        },
        {
          heading: "Contact",
          body: "Privacy questions can be sent to privacy@gotix.example and are answered within five business days.",
        },
      ]}
    />
  
  );
}
