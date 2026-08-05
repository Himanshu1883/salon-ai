import appointmentImg from "@/assets/appoinment.png";
import bannerModern from "@/assets/banner-modern.jpg";
import billingImg from "@/assets/biling.png";
import customersImg from "@/assets/customers.png";
import dashboardImg from "@/assets/dashboard.png";
import inventoryImg from "@/assets/inventory.png";
import { MODULE_GROUPS } from "@/lib/site-data";
import { createFileRoute } from "@tanstack/react-router";
// report.png not present; reuse services image for report slots
// import reportImg from "@/assets/report.png";
import servicesImg from "@/assets/services.png";
import settingImg from "@/assets/setting.png";
import staffImg from "@/assets/staff.png";
import { CtaBanner } from "@/components/site/Cta";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { ImageSlot, PageHero } from "@/components/site/Sections";

const TITLE = "22+ Salon ERP Modules — Gotix";
const DESC =
  "Explore all Gotix modules: appointments, POS, billing, inventory, CRM, staff, payroll, marketing, WhatsApp, reports and analytics.";

const MODULE_IMAGES: Record<string, string> = {
  Dashboard: dashboardImg,
  Appointments: appointmentImg,
  Billing: billingImg,
  Customers: customersImg,
  Inventory: inventoryImg,
  Services: servicesImg,
  Staff: staffImg,
  Reports: servicesImg,
  Settings: settingImg,
};

export const Route = createFileRoute("/modules")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: ModulesPage,
});

function ModulesPage() {
  return (
    <>
      <PageHero
        eyebrow="Modules"
        title={
          <>
            22+ Modules. <em className="italic text-primary">One</em> Intelligent Platform.
          </>
        }
        subtitle="Every part of a salon business, designed to work as one system — from the front desk to payroll day."
        image={bannerModern}
        imageAlt="Modern salon interior with styling stations"
      />

      <div className="mx-auto w-full max-w-[1500px] space-y-20 px-5 pb-24 sm:px-8">
        {MODULE_GROUPS.map((group) => (
          <section key={group.group}>
            <Reveal>
              <p className="eyebrow">{group.group}</p>
              <div className="hairline-gold mt-4 w-40" />
            </Reveal>
            <Stagger className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((m) => (
                <StaggerItem key={m.title}>
                  <article className="surface-card lift group h-full overflow-hidden">
                    <ImageSlot
                      name={`module-${m.title.toLowerCase().replace(/\s+/g, "-")}.jpg`}
                      alt={`${m.title} module preview`}
                      src={MODULE_IMAGES[m.title]}
                      ratio="aspect-[16/9]"
                      className="rounded-none transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="p-6">
                      <h2 className="font-display text-xl">{m.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        ))}
      </div>

      <CtaBanner title="See all 22 modules in action." />
    </>
  );
}
