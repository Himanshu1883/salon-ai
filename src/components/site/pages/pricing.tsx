"use client";

import { Accordion, CtaBanner } from "@/components/site/Cta";
import { Reveal } from "@/components/site/Reveal";
import { SectionBackdrop } from "@/components/site/SectionBackdrop";
import { PLANS } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Headphones,
  Minus,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  Award,
  Clock,
  Calendar,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";

const DISPLAY_PLANS = PLANS.filter(
  (plan) => plan.name === "Starter" || plan.name === "Professional",
);

const COMPARE_ROWS = [
  { feature: "Staff members", starter: "Up to 3", pro: "Up to 15" },
  { feature: "Locations", starter: "1", pro: "1 (+ add-ons)" },
  { feature: "Appointments & calendar", starter: true, pro: true },
  { feature: "POS billing & receipts", starter: true, pro: true },
  { feature: "CRM & client history", starter: "Basic", pro: "Advanced" },
  { feature: "WhatsApp reminders", starter: true, pro: true },
  { feature: "All 22 ERP modules", starter: false, pro: true },
  { feature: "AI analytics & forecasting", starter: false, pro: true },
  { feature: "Marketing automation", starter: false, pro: true },
  { feature: "Inventory & purchase orders", starter: false, pro: true },
  { feature: "Memberships & packages", starter: false, pro: true },
  { feature: "Multi-branch dashboard", starter: false, pro: "Add-on" },
  { feature: "Support", starter: "Email", pro: "Priority" },
  { feature: "Data migration", starter: "Self-serve", pro: "Free assisted" },
] as const;

const INCLUDED_EVERYWHERE = [
  "14-day free trial — no credit card",
  "Free onboarding & staff training",
  "Cancel anytime, no lock-in",
  "99.9% uptime SLA",
  "Secure cloud backup daily",
  "Mobile-friendly staff app",
];

const GUARANTEES = [
  {
    icon: Shield,
    title: "No hidden fees",
    description: "Transparent pricing with no setup costs or surprise charges.",
  },
  {
    icon: Zap,
    title: "Free data migration",
    description: "We migrate from Fresha, Booksy, Zoho or Excel at no extra cost.",
  },
  {
    icon: Headphones,
    title: "Human support",
    description: "Real people who know salons — not ticket bots.",
  },
];

const PRICING_FAQS = [
  {
    q: "What's included in the 14-day free trial?",
    a: "You get full access to all modules including appointments, POS, inventory, CRM, AI analytics, marketing tools, and WhatsApp integration. No credit card required, and you can cancel anytime during the trial period.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes, you can upgrade or downgrade anytime from your billing settings. Changes are prorated automatically, and you'll only pay the difference for the remaining billing period.",
  },
  {
    q: "Is there a setup fee or contract lock-in?",
    a: "No setup fee whatsoever. All plans are month-to-month with no long-term contracts. You can cancel anytime with just one click — no questions asked.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards, UPI, net banking, and bank transfers. Annual plans can be paid via invoice for enterprise clients.",
  },
  {
    q: "Do you offer discounts for non-profits or educational institutions?",
    a: "Yes! We offer special pricing for non-profit organizations, academies, and educational institutions. Contact our sales team for custom quotes.",
  },
  {
    q: "What happens after my free trial ends?",
    a: "You'll receive a notification 3 days before your trial ends. Your data will be saved, and you can choose to subscribe to a plan or export your data at any time.",
  },
  {
    q: "Can I add more staff members or locations later?",
    a: "Absolutely. Starter plan supports up to 3 staff and 1 location. Professional supports up to 15 staff with multi-location add-ons available. Contact sales for custom packages.",
  },
  {
    q: "Is data migration included?",
    a: "Self-serve migration tools are included in both plans. Professional plan includes free assisted migration where our team helps you move data from Fresha, Booksy, Zoho, or Excel.",
  },
];

function CompareCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Check className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (value === false) {
    return <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" />;
  }
  return <span className="text-sm font-medium text-foreground">{value}</span>;
}

function PricingPage() {
  const [annual, setAnnual] = useState(false);

  const plans = useMemo(
    () =>
      DISPLAY_PLANS.map((plan) => ({
        ...plan,
        price: annual ? plan.annual : plan.monthly,
        billed: annual ? "Billed annually · save 15%" : "Billed monthly · Cancel anytime",
      })),
    [annual],
  );

  return (
    <>
      {/* Hero */}
      <section className="relative isolate w-full overflow-hidden border-b border-border/60 pt-28 pb-16 sm:pt-32 sm:pb-20">
        <SectionBackdrop variant="pricing" fadeFrom="background" />
        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              Simple pricing
            </span>
            <h1 className="mt-6 font-display text-4xl leading-[1.05] sm:text-5xl lg:text-[3.25rem]">
              Plans that{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                grow with you
              </span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Two straightforward plans for salons at every stage. Every plan includes onboarding,
              data migration help, and a 14-day free trial.
            </p>

            <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-card/80 p-1 backdrop-blur-sm">
              {[
                { label: "Monthly", value: false },
                { label: "Annual · save 15%", value: true },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setAnnual(option.value)}
                  aria-pressed={annual === option.value}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    annual === option.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Plan cards - Same style as home page */}
      <section className="relative w-full py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div
                  className={cn(
                    "home-pricing-card relative h-full overflow-hidden rounded-2xl border p-8 transition-all duration-300",
                    plan.popular
                      ? "home-pricing-card-pro bg-gradient-to-b from-primary/5 to-transparent border-primary"
                      : "home-pricing-card-starter border-border/50 bg-card/50",
                  )}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute right-4 top-4 z-10">
                      <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-medium text-primary-foreground shadow-sm shadow-primary/20">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan name */}
                  <div className="relative z-10 flex items-center gap-3">
                    <div
                      className={cn(
                        "rounded-lg p-2.5 transition-colors duration-500",
                        plan.popular
                          ? "bg-primary/10 group-hover:bg-primary/15"
                          : "bg-muted/50 group-hover:bg-primary/10",
                      )}
                    >
                      {plan.name === "Starter" && (
                        <Zap className="h-5 w-5 text-primary transition-colors duration-500 group-hover:text-primary" />
                      )}
                      {plan.name === "Professional" && (
                        <TrendingUp className="h-5 w-5 text-primary transition-colors duration-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-display text-xl font-medium transition-colors duration-500 group-hover:text-foreground">
                        {plan.name}
                      </p>
                      <p className="text-xs text-muted-foreground transition-colors duration-500 group-hover:text-muted-foreground/80">
                        {plan.name === "Starter"
                          ? "For growing salons"
                          : "For established businesses"}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="relative z-10 mt-6">
                    <p className="font-display text-5xl font-bold">
                      ₹{plan.price?.toLocaleString("en-IN")}
                      <span className="ml-1 text-base font-normal text-muted-foreground">
                        /mo
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {plan.billed}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="relative z-10 mt-4 text-sm leading-relaxed text-muted-foreground transition-colors duration-500 group-hover:text-muted-foreground/90">
                    {plan.desc}
                  </p>

                  {/* Features list */}
                  <div className="relative z-10 mt-6 space-y-2.5">
                    {plan.includes.slice(0, 5).map((feature, featureIndex) => (
                      <div
                        key={feature}
                        className="flex items-start gap-2 transition-colors duration-500"
                        style={{ transitionDelay: `${featureIndex * 40}ms` }}
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary transition-colors duration-500 group-hover:text-primary" />
                        <span className="text-sm text-muted-foreground transition-colors duration-500 group-hover:text-foreground/75">
                          {feature}
                        </span>
                      </div>
                    ))}
                    {plan.includes.length > 5 && (
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground transition-colors duration-500 group-hover:text-foreground/70">
                          +{plan.includes.length - 5} more features
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="relative z-10 mt-8">
                    <Link
                      href={plan.to}
                      className={cn(
                        "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-[background-color,border-color,box-shadow,color] duration-500",
                        plan.popular
                          ? "bg-primary text-primary-foreground group-hover:bg-primary-dark group-hover:shadow-lg group-hover:shadow-primary/25"
                          : "border border-border/50 bg-background/50 text-foreground group-hover:border-primary/40 group-hover:bg-primary/5 group-hover:shadow-[0_0_20px_-10px] group-hover:shadow-primary/15",
                      )}
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Included everywhere */}
          <Reveal className="mx-auto mt-12 max-w-3xl">
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-display text-lg">Included with every plan</h3>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {INCLUDED_EVERYWHERE.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Comparison table */}
      <section className="relative w-full border-y border-border/60 bg-card/40 py-16 lg:py-20">
        <SectionBackdrop variant="grid" fadeFrom="card" />
        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Compare plans</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">See exactly what you get</h2>
            <p className="mt-3 text-muted-foreground">
              Starter covers the essentials. Professional unlocks the full Gotix operating system.
            </p>
          </Reveal>

          <Reveal className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Feature</th>
                    <th className="px-5 py-4 text-center text-sm font-semibold">Starter</th>
                    <th className="px-5 py-4 text-center text-sm font-semibold text-primary">
                      Professional
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={cn(
                        "border-b border-border/60 last:border-0",
                        i % 2 === 0 ? "bg-background/40" : "bg-transparent",
                      )}
                    >
                      <td className="px-5 py-3.5 text-sm text-foreground">{row.feature}</td>
                      <td className="px-5 py-3.5 text-center">
                        <CompareCell value={row.starter} />
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <CompareCell value={row.pro} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          <Reveal className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Need multi-branch or custom integrations?{" "}
              <Link href="/contact" className="font-medium text-primary hover:underline">
                Talk to our sales team
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Guarantees */}
      <section className="w-full py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {GUARANTEES.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="surface-card lift h-full p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-purple-500/5 to-transparent p-8 text-center sm:flex-row sm:justify-between sm:text-left">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-lg">Trusted by 1,200+ salons</p>
                  <p className="text-sm text-muted-foreground">
                    Join owners who switched and never looked back.
                  </p>
                </div>
              </div>
              <Link href="/signup" className="btn-base btn-primary shrink-0">
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ - Pricing related */}
      <section className="w-full border-t border-border/60 pb-24 pt-16">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Reveal className="mx-auto max-w-3xl">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">FAQs</span>
              </div>
              <h2 className="mt-6 font-display text-3xl sm:text-4xl">
                Pricing{" "}
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Questions
                </span>
              </h2>
              <p className="mt-3 text-muted-foreground">
                Everything you need to know before you start your free trial.
              </p>
            </div>
            <div className="mt-10">
              <Accordion items={PRICING_FAQS} />
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBanner title="Try every module free for 14 days." />
    </>
  );
}

export default PricingPage;