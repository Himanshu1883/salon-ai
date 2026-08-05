"use client";

import { PLATFORM_TABS } from "@/lib/site-data";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { CtaBanner } from "@/components/site/Cta";
import { ImageSlot, PageHero } from "@/components/site/Sections";

const appointmentImg = "/gotix/appoinment.png";
const billingImg = "/gotix/biling.png";
const customersImg = "/gotix/customers.png";
const dashboardImg = "/gotix/dashboard.png";
const inventoryImg = "/gotix/inventory.png";
const servicesImg = "/gotix/services.png";

// report.png not present; reuse services image for report slots
// const reportImg = "/gotix/report.png";

const TITLE = "Platform Preview — Inside Gotix";
const DESC =
  "Take an interactive tour of the Gotix platform: dashboard, scheduling, billing, CRM, inventory, marketing, reports and AI analytics.";

const PLATFORM_IMAGES: Record<string, string> = {
  Dashboard: dashboardImg,
  Appointment: appointmentImg,
  Billing: billingImg,
  CRM: customersImg,
  Inventory: inventoryImg,
  Marketing: servicesImg,
  Reports: servicesImg,
};


function PlatformPage() {
  const [active, setActive] = useState(PLATFORM_TABS[0]!.key);
  const tab = PLATFORM_TABS.find((t) => t.key === active)!;

  return (
    <>
      <PageHero
        eyebrow="Platform"
        title={
          <>
            A product tour of the <em className="italic text-primary">whole salon.</em>
          </>
        }
        subtitle="Eight surfaces your team uses every day — click through to see how each one works."
      />

      <section className="w-full pb-24">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <div className="flex flex-wrap gap-2 border-b border-border pb-4">
            {PLATFORM_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActive(t.key)}
                aria-pressed={active === t.key}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active === t.key
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {t.key}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab.key}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12 grid items-center gap-10 lg:grid-cols-2"
            >
              <div>
                <p className="eyebrow">{tab.key}</p>
                <h2 className="mt-3 text-3xl sm:text-4xl">{tab.title}</h2>
                <p className="mt-4 text-muted-foreground">{tab.desc}</p>
              </div>
              <ImageSlot
                name={`platform-${tab.key.toLowerCase()}.jpg`}
                alt={`${tab.title} screen preview`}
                src={PLATFORM_IMAGES[tab.key]}
                ratio="aspect-[16/10]"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <CtaBanner title="Want a guided walkthrough?" />
    </>
  );
}

export default PlatformPage;
