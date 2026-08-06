"use client";

import { Counter } from "@/components/site/Counter";
import { CtaBanner } from "@/components/site/Cta";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { SectionBackdrop } from "@/components/site/SectionBackdrop";
import { STATS, TESTIMONIALS } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Globe,
  Heart,
  Lightbulb,
  MessageSquare,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
} from "lucide-react";

const teamImg = "/gotix/about-team.jpg";
const heroImg = "/gotix/hero-salon.jpg";
const officeImg = "/gotix/contact-office.jpg";

const TIMELINE = [
  {
    year: "2021",
    title: "A front desk problem",
    copy: "We ran salon operations ourselves and lost hours every day to spreadsheets, missed calls, and double-bookings.",
  },
  {
    year: "2023",
    title: "One system, 22 modules",
    copy: "We rebuilt the entire salon workflow — from walk-in queue to payroll — as a single connected platform.",
  },
  {
    year: "2025",
    title: "Intelligence layer",
    copy: "AI forecasting, smart recommendations, and inventory prediction shipped to every Professional plan.",
  },
  {
    year: "2026",
    title: "1,200+ salons",
    copy: "Boutique studios and multi-branch chains across India now run their day on Gotix.",
  },
];

const VALUES = [
  {
    icon: Heart,
    title: "Salon-first always",
    desc: "Every feature is tested on real floors with owners, receptionists, and stylists in the room.",
  },
  {
    icon: Lightbulb,
    title: "Clarity over complexity",
    desc: "Fewer taps, clearer numbers, and screens that make sense when the Saturday rush hits.",
  },
  {
    icon: Shield,
    title: "Trust by design",
    desc: "Your client data is encrypted, backed up daily, and never sold. Period.",
  },
  {
    icon: Rocket,
    title: "Ship what scales",
    desc: "From a single chair to fifty branches — the same platform grows without re-platforming.",
  },
];

const PILLARS = [
  {
    icon: Calendar,
    title: "Operations",
    desc: "Appointments, queue, POS, and staff scheduling in one flow.",
    tags: ["Booking", "Billing", "Queue"],
  },
  {
    icon: Users,
    title: "Relationships",
    desc: "CRM, memberships, and WhatsApp that turn visits into loyalty.",
    tags: ["CRM", "Loyalty", "WhatsApp"],
  },
  {
    icon: BarChart3,
    title: "Intelligence",
    desc: "AI demand forecasting, revenue insights, and inventory alerts.",
    tags: ["Analytics", "Forecasting", "Reports"],
  },
  {
    icon: Building2,
    title: "Scale",
    desc: "Multi-branch dashboards, role permissions, and centralized control.",
    tags: ["Multi-branch", "Roles", "API"],
  },
];

const PROCESS = [
  {
    step: "01",
    title: "Discover & configure",
    desc: "We map your services, staff, and workflows — then configure Gotix around how you already work.",
    points: ["Salon audit", "Module setup", "Data import"],
  },
  {
    step: "02",
    title: "Launch & train",
    desc: "Go live with appointments, POS, and inventory. Your team learns in days, not months.",
    points: ["Live booking", "POS training", "Staff onboarding"],
  },
  {
    step: "03",
    title: "Grow & optimize",
    desc: "AI insights, marketing automation, and reporting that compound over time.",
    points: ["AI analytics", "Automation", "Multi-branch"],
  },
];

const ROLES = [
  {
    icon: Target,
    title: "Owners",
    desc: "Revenue clarity, branch comparison, and growth levers without living in spreadsheets.",
  },
  {
    icon: Users,
    title: "Managers",
    desc: "Staff schedules, inventory, and floor oversight from one dashboard.",
  },
  {
    icon: Sparkles,
    title: "Stylists",
    desc: "Client history at chair-side, commissions tracked, and fewer admin interruptions.",
  },
  {
    icon: MessageSquare,
    title: "Reception",
    desc: "Fast check-in, waitlist management, and payments without switching tools.",
  },
];

const BELIEFS = [
  "A stylist's time belongs to their client — not paperwork.",
  "Software should feel as considered as the space it serves.",
  "Automation should be quiet — powerful, but never in the way.",
  "Every salon deserves enterprise-grade intelligence.",
];

function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[88svh] w-full flex-col overflow-hidden border-b border-border/60 pt-[4.5rem] sm:pt-[5rem]">
        <SectionBackdrop variant="features" image={heroImg} fadeFrom="background" />
        <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col justify-center px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.9fr)] lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                About Gotix
              </span>
              <h1 className="mt-6 max-w-2xl font-display text-4xl leading-[1.04] sm:text-5xl lg:text-[3.5rem]">
                Built by people who{" "}
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  understand salons.
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                We believe a stylist&apos;s time belongs to their client — not to paperwork. Gotix
                gives beauty businesses the operational intelligence of an enterprise brand, in
                software that feels as considered as their space.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup" className="btn-base btn-primary">
                  Start free trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="btn-base btn-outline bg-background/60 backdrop-blur-sm">
                  Talk to our team
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative mx-auto w-full max-w-lg lg:max-w-none"
            >
              <div className="absolute -inset-6 rounded-[2.5rem] bg-primary/10 blur-3xl" aria-hidden />
              <div className="relative overflow-hidden rounded-[2rem] border border-border/60 shadow-2xl">
                <img
                  src={teamImg}
                  alt="The Gotix team collaborating in a bright studio office"
                  className="aspect-[5/4] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                    Our team
                  </p>
                  <p className="mt-1 font-display text-lg text-white">
                    Product, design & support — all salon-obsessed.
                  </p>
                </div>
              </div>
              <motion.div
                className="glass-card absolute -left-4 top-8 hidden px-4 py-3 shadow-lg drift lg:block"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Since</p>
                <p className="font-display text-xl font-bold">2021</p>
              </motion.div>
              <motion.div
                className="glass-card absolute -right-4 bottom-12 hidden px-4 py-3 shadow-lg drift lg:block"
                style={{ animationDelay: "0.8s" }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
              >
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Salons</p>
                <p className="font-display text-xl font-bold">1,200+</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative w-full border-b border-border/60 bg-card/40 py-12">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Stagger className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {STATS.map((stat) => (
              <StaggerItem key={stat.label} className="text-center sm:text-left">
                <p className="font-display text-3xl sm:text-4xl">
                  <Counter value={stat.value} suffix={stat.suffix} decimals={stat.decimals ?? 0} />
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {stat.label}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Mission & vision */}
      <section className="relative w-full py-20 lg:py-28">
        <SectionBackdrop variant="mesh" fadeFrom="background" />
        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <div className="relative overflow-hidden rounded-[2rem] border border-border/60 shadow-xl">
                <img
                  src={officeImg}
                  alt="Modern workspace where Gotix is built"
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent" />
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="eyebrow">Our mission</p>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl">
                Software that respects the craft.
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Gotix is built with owners, receptionists, and stylists in the room. Every screen is
                designed for a busy floor: fewer taps, clearer numbers, and automation that quietly
                handles the follow-ups.
              </p>
              <div className="mt-8 space-y-3">
                {BELIEFS.map((belief) => (
                  <div key={belief} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-foreground/85">{belief}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, i) => (
              <div
                key={value.title}
                className="surface-card lift h-full p-6"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary">
                  <value.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.desc}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Story timeline */}
      <section className="relative w-full border-y border-border/60 bg-muted/20 py-20 lg:py-28">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Our story</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              From a front-desk problem to 1,200+ salons.
            </h2>
            <p className="mt-4 text-muted-foreground">
              We didn&apos;t set out to build generic business software. We set out to fix the chaos
              we lived every Saturday.
            </p>
          </Reveal>

          <div className="relative mt-14">
            <div
              className="absolute left-4 top-0 hidden h-full w-px bg-gradient-to-b from-primary/40 via-border to-transparent lg:left-1/2 lg:block"
              aria-hidden
            />
            <div className="space-y-8 lg:space-y-12">
              {TIMELINE.map((item, i) => (
                <Reveal key={item.year} delay={i * 0.06}>
                  <div
                    className={cn(
                      "relative grid gap-6 lg:grid-cols-2 lg:gap-12",
                      i % 2 === 1 && "lg:[&>div:first-child]:order-2",
                    )}
                  >
                    <div className={cn("lg:text-right", i % 2 === 1 && "lg:text-left")}>
                      <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 font-display text-sm font-semibold text-primary">
                        {item.year}
                      </span>
                      <h3 className="mt-3 font-display text-xl sm:text-2xl">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {item.copy}
                      </p>
                    </div>
                    <div className="hidden lg:block" aria-hidden />
                    <span className="absolute left-4 top-2 hidden h-3 w-3 -translate-x-1/2 rounded-full border-2 border-primary bg-background lg:left-1/2 lg:block" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What we build */}
      <section className="relative w-full py-20 lg:py-28">
        <SectionBackdrop variant="grid" fadeFrom="background" />
        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Reveal className="max-w-xl">
            <p className="eyebrow">What we build</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              One platform. Every surface of your business.
            </h2>
            <p className="mt-4 text-muted-foreground">
              22 integrated modules — not a patchwork of tools glued together with exports and
              workarounds.
            </p>
          </Reveal>

          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2">
            {PILLARS.map((pillar) => (
              <StaggerItem key={pillar.title}>
                <div className="group surface-card lift h-full p-7">
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                      <pillar.icon className="h-5 w-5" />
                    </span>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {pillar.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <h3 className="mt-5 font-display text-xl">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mt-10">
            <Link
              href="/platform"
              className="inline-flex items-center gap-2 font-medium text-primary transition-all hover:gap-3"
            >
              Explore the full platform <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* How we partner */}
      <section className="relative w-full border-y border-border/60 bg-card/30 py-20 lg:py-28">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">How we partner</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">Live in days, not months.</h2>
            <p className="mt-4 text-muted-foreground">
              White-glove onboarding is included — we import your data, train your team, and stay
              with you through launch.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PROCESS.map((step, i) => (
              <Reveal key={step.step} delay={i * 0.08}>
                <div className="relative h-full rounded-2xl border border-border/60 bg-background/80 p-7 backdrop-blur-sm">
                  <span className="font-display text-4xl font-bold text-primary/20">{step.step}</span>
                  <h3 className="mt-2 font-display text-xl">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                  <ul className="mt-5 space-y-2">
                    {step.points.map((point) => (
                      <li key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Built for every role */}
      <section className="relative w-full py-20 lg:py-28">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Reveal className="max-w-xl">
            <p className="eyebrow">For your whole team</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              Built for every role on the floor.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Owners get clarity. Managers get control. Reception and stylists get speed — without
              learning eight different tools.
            </p>
          </Reveal>

          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((role) => (
              <StaggerItem key={role.title}>
                <div className="surface-card lift h-full p-6">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <role.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg">{role.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{role.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative w-full overflow-hidden border-y border-border/60 bg-ink py-20 text-ink-foreground lg:py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
          aria-hidden
        />
        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-primary">Salon voices</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Trusted by owners who switched.</h2>
          </Reveal>

          <Stagger className="mt-12 grid gap-6 md:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <StaggerItem key={t.name}>
                <blockquote className="h-full rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-ink-foreground/85">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 to-purple-600/40 font-display text-sm font-bold text-white">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-ink-foreground/55">{t.role}</p>
                    </div>
                  </footer>
                </blockquote>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Global + careers */}
      <section className="relative w-full py-20 lg:py-28">
        <SectionBackdrop variant="pricing" fadeFrom="background" />
        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <p className="eyebrow">Where we&apos;re headed</p>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl">
                India first. Built for the world.
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Gotix is engineered for Indian salons — UPI, GST, WhatsApp, and local workflows —
                with architecture ready to serve beauty businesses globally.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Globe, label: "Pan-India coverage", sub: "Metro to tier-2 cities" },
                  { icon: Award, label: "ISO-ready infra", sub: "Enterprise-grade security" },
                  { icon: Zap, label: "99.9% uptime", sub: "Always-on cloud platform" },
                  { icon: Users, label: "24/7 support", sub: "Humans who know salons" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-border/60 bg-card/50 p-4 backdrop-blur-sm"
                  >
                    <item.icon className="h-4 w-4 text-primary" />
                    <p className="mt-2 text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary/8 via-purple-500/5 to-transparent p-8 sm:p-10">
                <p className="eyebrow">Join us</p>
                <h3 className="mt-3 font-display text-2xl sm:text-3xl">Come build with us.</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  We&apos;re a small team obsessed with salon operations, design, and AI. If that
                  sounds like you — we&apos;d love to hear from you.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/contact" className="btn-base btn-primary">
                    Get in touch
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/demo" className="btn-base btn-outline">
                    Book a demo
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <CtaBanner title="Ready to run your salon on Gotix?" />
    </>
  );
}

export default AboutPage;
