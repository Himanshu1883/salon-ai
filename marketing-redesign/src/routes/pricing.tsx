import { Accordion, CtaBanner } from "@/components/site/Cta";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { PageHero } from "@/components/site/Sections";
import { FAQS, PLANS } from "@/lib/site-data";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";

const TITLE = "Pricing — Gotix Plans From ₹1,999/mo";
const DESC =
  "Starter, Professional, Business and Enterprise plans for salons and chains. 14-day free trial, no setup fee, free data migration.";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title={
          <>
            Plans That <em className="italic text-primary">Grow With You.</em>
          </>
        }
        subtitle="Every plan includes onboarding, data migration and staff training. Cancel anytime."
      >
        <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
          {[
            { label: "Monthly", value: false },
            { label: "Annual · save 15%", value: true },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => setAnnual(o.value)}
              aria-pressed={annual === o.value}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                annual === o.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </PageHero>

      <section className="w-full pb-24">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => {
              const price = annual ? p.annual : p.monthly;
              return (
                <StaggerItem key={p.name}>
                  <div
                    className={`surface-card lift relative flex h-full flex-col p-7 ${
                      p.popular ? "border-primary shadow-[var(--shadow-soft)]" : ""
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-3 left-7 rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink">
                        Most popular
                      </span>
                    )}
                    <h2 className="font-display text-xl">{p.name}</h2>
                    <p className="mt-4 font-display text-4xl">
                      {price ? `₹${price.toLocaleString("en-IN")}` : "Custom"}
                      {price && <span className="text-sm text-muted-foreground">/mo</span>}
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
                    <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                      {p.includes.map((inc) => (
                        <li key={inc} className="flex gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                          {inc}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={p.to}
                      className={`btn-base mt-7 w-full ${
                        p.popular ? "btn-primary" : "btn-outline"
                      }`}
                    >
                      {p.cta}
                    </Link>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>

          <Reveal className="mx-auto mt-20 max-w-3xl">
            <h2 className="text-center text-2xl sm:text-3xl">Pricing questions</h2>
            <div className="mt-8">
              <Accordion items={FAQS.slice(4)} />
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBanner title="Try every module free for 14 days." />
    </>
  );
}
