import { LegalPage } from "@/components/site/LegalPage";

const TITLE = "Security — Gotix";
const DESC =
  "Encryption, access control, backups and compliance practices that protect your salon and client data.";

export default function SecurityPageView() {
  return (

    <LegalPage
      title="Security"
      intro="Salon data is business-critical. Here is how we protect it."
      sections={[
        {
          heading: "Encryption",
          body: "All traffic is encrypted in transit with TLS 1.2+, and data at rest is encrypted on managed infrastructure.",
        },
        {
          heading: "Access control",
          body: "Role-based permissions per branch, with audit logs for billing, inventory and client record changes.",
        },
        {
          heading: "Backups",
          body: "Automated daily backups with point-in-time recovery windows for paid plans.",
        },
        {
          heading: "Responsible disclosure",
          body: "Report suspected vulnerabilities to security@gotix.example; we acknowledge within 48 hours.",
        },
      ]}
    />
  
  );
}
