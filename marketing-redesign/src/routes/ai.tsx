import aiHero from "@/assets/ai-hero.jpg";
import { CtaBanner } from "@/components/site/Cta";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { PageHero } from "@/components/site/Sections";
import { AI_CARDS } from "@/lib/site-data";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

const TITLE = "AI Analytics for Salons — Gotix";
const DESC =
  "Demand forecasting, smart service recommendations, revenue optimization and inventory intelligence — AI that understands your salon.";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: AiPage,
});

const BARS = [42, 58, 35, 76, 64, 92, 71];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function AiPage() {
  return (
    <>
      <PageHero
        dark
        eyebrow="AI Analytics"
        title={
          <>
            AI That Understands <em className="italic text-gold">Your Salon.</em>
          </>
        }
        subtitle="Predictive analytics, smart scheduling, and automated insights that help you grow revenue while delivering exceptional client experiences."
        image={aiHero}
        imageAlt="Abstract violet data visualization representing AI insights"
      />

      <section className="w-full gradient-ink pb-24 text-ink-foreground">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Stagger className="grid gap-5 sm:grid-cols-2">
            {AI_CARDS.map((c) => (
              <StaggerItem key={c.title}>
                <div className="h-full rounded-2xl border border-white/12 bg-white/5 p-8 backdrop-blur-sm transition hover:-translate-y-1 hover:border-gold/50">
                  <div className="h-10 w-10 rounded-xl gradient-brand" />
                  <h2 className="mt-6 font-display text-2xl text-ink-foreground">{c.title}</h2>
                  <p className="mt-3 text-ink-foreground/65">{c.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mt-16">
            <div className="rounded-3xl border border-white/12 bg-white/5 p-8 backdrop-blur-sm">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow !text-gold">Forecast</p>
                  <h3 className="mt-2 font-display text-2xl text-ink-foreground">
                    Predicted demand · next 7 days
                  </h3>
                </div>
                <p className="text-sm text-ink-foreground/60">
                  Saturday peak — staff 2 extra stylists
                </p>
              </div>
              <div className="mt-10 flex h-56 items-end gap-3 sm:gap-6">
                {BARS.map((h, i) => (
                  <div key={DAYS[i]} className="flex-1 text-center">
                    <motion.div
                      className="w-full rounded-t-lg gradient-brand"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h * 2}px` }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{
                        duration: 0.7,
                        delay: i * 0.08,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                    <p className="mt-3 text-xs text-ink-foreground/55">{DAYS[i]}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBanner title="Put AI to work in your salon." />
    </>
  );
}
