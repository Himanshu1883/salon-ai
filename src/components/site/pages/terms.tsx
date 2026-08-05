import { LegalPage } from "@/components/site/LegalPage";

const TITLE = "Terms of Service — Gotix";
const DESC =
  "The terms that govern use of the Gotix platform, subscriptions, trials and acceptable use.";

export default function TermsPageView() {
  return (

    <LegalPage
      title="Terms of Service"
      intro="Plain-language terms for using Gotix. No hidden lock-ins."
      sections={[
        {
          heading: "Subscriptions",
          body: "Plans bill monthly or annually in advance. You can upgrade, downgrade or cancel at any time; changes are prorated.",
        },
        {
          heading: "Free trial",
          body: "Trials run 14 days with full module access and no credit card requirement.",
        },
        {
          heading: "Acceptable use",
          body: "Do not use the platform to send unsolicited messaging or to store data you are not permitted to process.",
        },
        {
          heading: "Availability",
          body: "We target 99.9% monthly uptime, with planned maintenance announced in advance.",
        },
        {
          heading: "Termination",
          body: "You may close your workspace at any time and export your data before deletion.",
        },
      ]}
    />
  
  );
}
