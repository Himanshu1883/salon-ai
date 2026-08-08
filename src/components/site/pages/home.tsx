"use client";

import { CtaBanner } from "@/components/site/Cta";
import { HomeHero } from "@/components/site/HomeHero";
import { PlatformFlow } from "@/components/site/PlatformFlow";
import { Reveal } from "@/components/site/Reveal";
import { SectionBackdrop } from "@/components/site/SectionBackdrop";
import { ParallaxBanner } from "@/components/site/Sections";
import {
  AI_CARDS,
  ALL_MODULES,
  FEATURES,
  PLANS,
  SALON_TYPES,
  TESTIMONIALS,
} from "@/lib/site-data";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cloud,
  CreditCard, // Add this
  Headphones, // Add this
  Layers,
  MessageSquare,
  Package,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

const bannerAppointments = "/gotix/banner-appointments.jpg";
const bannerGrowth = "/gotix/banner-growth.jpg";
const bannerModern = "/gotix/banner-modern.jpg";

function unsplash(id: string, w = 800) {
  return `https://images.unsplash.com/${id}?w=${w}&q=85&auto=format&fit=crop`;
}

const MODULES_SECTION_BG = unsplash("photo-1560066984-138dadb4c035", 1920);

/** Topic-matched Unsplash photos for each salon type card */
const SALON_TYPE_PHOTOS: Record<string, { src: string; alt: string }> = {
  "Hair Salon": {
    src: unsplash("photo-1562322140-8baeececf3df", 800),
    alt: "Hair salon styling station and mirrors",
  },
  "Beauty Salon": {
    src: unsplash("photo-1560066984-138dadb4c035", 800),
    alt: "Modern beauty salon interior",
  },
  Spa: {
    src: unsplash("photo-1544161515-4ab6ce6db874", 800),
    alt: "Spa wellness treatment room",
  },
  "Skin Clinic": {
    src: unsplash("photo-1570172619644-dfd03ed5d881", 800),
    alt: "Skincare treatment and clinic products",
  },
  "Barber Shop": {
    src: unsplash("photo-1600948836101-f9ffda59d250", 800),
    alt: "Barber shop chairs and grooming station",
  },
  "Nail Studio": {
    src: unsplash("photo-1706629503571-c165023a7792", 800),
    alt: "Nail studio manicure workspace",
  },
  "Makeup Studio": {
    src: unsplash("photo-1515377905703-c4788e51af15", 800),
    alt: "Makeup studio brushes and beauty tools",
  },
  "Bridal Studio": {
    src: unsplash("photo-1512496015851-a90fb38ba796", 800),
    alt: "Bridal beauty and wedding styling",
  },
  "Tattoo Studio": {
    src: unsplash("photo-1558618666-fcd25c85cd64", 800),
    alt: "Tattoo studio workstation",
  },
};

const FEATURED_MODULE_CARDS = [
  {
    title: "AI-Powered Scheduling",
    description:
      "Optimize appointments with machine learning that predicts peak times and reduces no-shows",
    icon: Sparkles,
    badge: "New",
    gradient: "from-violet-500 to-purple-600",
    image: unsplash("photo-1633681926022-84c23e8cb2d6", 1200),
    imageAlt: "Salon reception desk managing appointment bookings",
  },
  {
    title: "Smart Inventory",
    description:
      "Automated stock management with predictive reordering and supplier integration",
    icon: Package,
    badge: "Popular",
    gradient: "from-emerald-500 to-teal-600",
    image: unsplash("photo-1596462502278-27bfdc403348", 1200),
    imageAlt: "Beauty products and salon inventory on display shelves",
  },
  {
    title: "Client Intelligence",
    description:
      "Deep client insights with purchase patterns, preferences, and automated engagement",
    icon: TrendingUp,
    badge: "AI-Powered",
    gradient: "from-blue-500 to-indigo-600",
    image: unsplash("photo-1522337660859-02fbefca4702", 1200),
    imageAlt: "Stylist consulting with a salon client about preferences",
  },
] as const;

const MODULE_CARD_IMAGES: Record<string, { src: string; alt: string }> = {
  Dashboard: {
    src: unsplash("photo-1551288049-bebda4e38f71"),
    alt: "Analytics dashboard showing salon performance metrics",
  },
  Appointments: {
    src: unsplash("photo-1633681926022-84c23e8cb2d6"),
    alt: "Salon reception desk for booking appointments",
  },
  "Walk In": {
    src: unsplash("photo-1600948836101-f9ffda59d250"),
    alt: "Client walking in for a same-day salon visit",
  },
  Queue: {
    src: unsplash("photo-1633681138600-295fcd688876"),
    alt: "Salon styling chairs and client waiting area",
  },
  "Multi Branch": {
    src: unsplash("photo-1560066984-138dadb4c035"),
    alt: "Multi-chair salon interior across branch locations",
  },
  Billing: {
    src: unsplash("photo-1556742049-0cfed4f6a45d"),
    alt: "Salon billing and card payment at checkout",
  },
  POS: {
    src: unsplash("photo-1633681926019-03bd9325ec20"),
    alt: "Salon counter with touch-friendly point-of-sale checkout",
  },
  Customers: {
    src: unsplash("photo-1522337660859-02fbefca4702"),
    alt: "Stylist speaking with a loyal salon customer",
  },
};

function getModuleCardImage(title: string) {
  return (
    MODULE_CARD_IMAGES[title] ?? {
      src: unsplash("photo-1560066984-138dadb4c035"),
      alt: "Professional salon workspace",
    }
  );
}

function HomePageView() {
  return (
    <>
      <HomeHero />

      {/* B. TRUST BRIDGE - Place it HERE, outside any other section */}
      {/* <div className="relative w-full overflow-hidden border-y border-border/60 bg-background/50 py-6 backdrop-blur-sm">
        <SectionBackdrop variant="strip" fadeFrom="none" />
        <div className="relative z-10 mx-auto flex w-full max-w-[1500px] items-center overflow-hidden px-5 sm:px-8">
          <motion.div
            className="flex shrink-0 items-center gap-12 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            {Array.from({ length: 2 }).flatMap((_, r) =>
              [
                { name: "Luxe Hair Studio", logo: "💇" },
                { name: "The Groom Room", logo: "✂️" },
                { name: "Glow Spa", logo: "🧖" },
                { name: "Bridal Bliss", logo: "👰" },
                { name: "Nail Art Studio", logo: "💅" },
                { name: "Skin Clinic", logo: "✨" },
                { name: "Tattoo Studio", logo: "🎯" },
                { name: "Beauty Bar", logo: "💄" },
              ].map((brand) => (
                <div
                  key={`${r}-${brand.name}`}
                  className="flex items-center gap-3"
                >
                  <span className="text-2xl">{brand.logo}</span>
                  <span className="text-sm font-medium text-foreground/70">
                    {brand.name}
                  </span>
                  <span className="text-muted-foreground/20">|</span>
                </div>
              )),
            )}
          </motion.div>
        </div>
      </div> */}

      {/* G2. PLATFORM FLOW — animated architecture map */}
      <PlatformFlow />

      {/* C. MODULES PREVIEW - Redesigned with limited modules */}
      <section className="relative isolate w-full overflow-hidden py-24 lg:py-24">
        <SectionBackdrop variant="mesh" image={MODULES_SECTION_BG} />

        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          {/* Section Header - Enhanced */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">
                  22+ Integrated Modules
                </span>
                <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  v3.0
                </span>
              </div>

              <h2 className="mt-6 max-w-3xl text-4xl font-display leading-[1.05] sm:text-5xl lg:text-[3.5rem]">
                Every Module Your Salon{" "}
                <span className="relative">
                  <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Actually Needs
                  </span>
                  <motion.span
                    className="absolute -bottom-2 left-0 h-0.5 w-full bg-gradient-to-r from-primary to-purple-600"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  />
                </span>
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                One powerful platform replaces spreadsheets, booking apps,
                billing software, and endless WhatsApp groups — all working
                together seamlessly.
              </p>

              {/* Quick stats */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
                {[
                  { label: "Modules", value: "22+", icon: Layers },
                  { label: "Integrations", value: "50+", icon: Cloud },
                  { label: "Active Users", value: "12.8K", icon: Users },
                  { label: "Uptime", value: "99.9%", icon: Shield },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i }}
                    className="flex items-center gap-2 rounded-full bg-card/50 px-4 py-2 backdrop-blur-sm border border-border/50"
                  >
                    <stat.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{stat.value}</span>
                    <span className="text-xs text-muted-foreground">
                      {stat.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Featured Modules Spotlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 grid gap-6 md:grid-cols-3"
          >
            {FEATURED_MODULE_CARDS.map((module, i) => (
              <div
                key={i}
                className="group relative min-h-[320px] overflow-hidden rounded-2xl border border-border/50 transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/10"
              >
                <img
                  src={module.image}
                  alt={module.imageAlt}
                  width={1200}
                  height={800}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 from-0% via-background/55 via-30% to-transparent to-55%" />
                <div
                  className={`absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${module.gradient} opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-35`}
                />

                <div className="relative flex h-full flex-col p-6">
                  <div className="flex items-start justify-between">
                    <div
                      className={`rounded-xl bg-gradient-to-br ${module.gradient} p-3 shadow-lg`}
                    >
                      <module.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="rounded-full border border-primary/15 bg-background/70 px-2.5 py-1 text-[10px] font-medium text-primary backdrop-blur-sm">
                      {module.badge}
                    </span>
                  </div>
                  <div className="mt-auto">
                    <h3 className="font-display text-lg font-medium">
                      {module.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {module.description}
                    </p>
                    <Link
                      href="/modules"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-all hover:gap-2"
                    >
                      Learn more
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* All Modules Grid - Showing only 8 modules as preview */}
          <div className="mt-16">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-medium">
                  Popular Modules
                </h3>
                <p className="text-sm text-muted-foreground">
                  Essential tools to run your salon efficiently
                </p>
              </div>
              <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
                <span>Showing 8 of 22+</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {/* Show only first 8 modules as preview */}
              {ALL_MODULES.slice(0, 8).map((module, index) => {
                const cardImage = getModuleCardImage(module.title);
                return (
                  <motion.div
                    key={module.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.04 }}
                    className="relative"
                  >
                    <div className="surface-card lift group/card relative h-full cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                      <div className="relative h-32 overflow-hidden bg-card sm:h-36">
                        <div className="absolute inset-0 transition-transform duration-500 will-change-transform group-hover/card:scale-[1.03]">
                          <img
                            src={cardImage.src}
                            alt={cardImage.alt}
                            width={800}
                            height={500}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="block h-full w-full object-cover"
                          />
                        </div>
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/60 from-10% via-card/10 via-24% to-transparent to-36%" />
                        <span className="absolute right-3 top-3 rounded-full border border-border/50 bg-background/75 px-2 py-0.5 text-[10px] font-medium text-primary/80 backdrop-blur-sm">
                          {module.group}
                        </span>
                      </div>
                      <div className="relative p-5">
                        <div className="rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 p-2.5 w-fit">
                          <div className="h-5 w-5 rounded bg-gradient-to-br from-primary to-purple-500" />
                        </div>
                        <p className="mt-3 font-display text-base font-medium">
                          {module.title}
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                          {module.group}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground/80 line-clamp-2">
                          {module.desc}
                        </p>

                        <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover/card:opacity-100">
                          <ArrowRight className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <span
                        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[3px] origin-left scale-x-0 rounded-b-2xl bg-primary transition-transform duration-300 group-hover/card:scale-x-100"
                        aria-hidden
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* View All Modules CTA */}
            <Reveal className="mt-10 text-center">
              <Link
                href="/modules"
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-6 py-3 font-medium text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:gap-3"
              >
                View All 22+ Modules
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative mt-16 overflow-hidden rounded-2xl border border-primary/10"
          >
            {/* Background Image - Unsplash */}
            <div className="absolute inset-0 -z-10">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80"
                alt="Modern office workspace"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-background/70" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent" />
              {/* Subtle pattern overlay */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
            </div>

            <div className="relative z-10 p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Ready to transform your salon?
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/signup"
                    className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25"
                  >
                    Start Free Trial
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/demo"
                    className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-6 py-3 font-medium backdrop-blur-sm transition-all hover:border-primary hover:bg-primary/5"
                  >
                    <Calendar className="h-4 w-4" />
                    Book a Demo
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground">
                  No credit card required • Free 14-day trial • 24/7 support
                </p>
              </div>
            </div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-center"
          >
            {[
              {
                icon: Shield,
                label: "Enterprise Grade Security",
                sub: "ISO 27001 certified",
              },
              {
                icon: Zap,
                label: "Lightning Fast",
                sub: "< 200ms response time",
              },
              {
                icon: Award,
                label: "Award Winning",
                sub: "Best Salon Software 2024",
              },
              {
                icon: Headphones,
                label: "24/7 Support",
                sub: "Dedicated account managers",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* D. FULL-WIDTH BANNERS - With Feature Lists */}
      <ParallaxBanner
        image={bannerModern}
        alt="Modern salon interior with a row of lit styling stations"
        headline="Built for Modern Salon Businesses"
        copy="Configurable services, taxes, memberships and branches — set up once, run everywhere."
        badge="Modern Salon"
      >
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              Configurable services
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              Taxes & memberships
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              Multi-branch support
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              24/7 availability
            </span>
          </div>
        </div>
      </ParallaxBanner>

      <ParallaxBanner
        image={bannerAppointments}
        alt="Salon receptionist managing bookings at a cream and brass reception desk"
        headline="Manage Every Appointment Without Missing a Customer"
        copy="Smart scheduling with conflict detection, automated WhatsApp reminders and a live walk-in queue."
        align="right"
        badge="Smart Scheduling"
      >
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              Conflict detection
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              WhatsApp reminders
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              Live walk-in queue
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              Automated confirmations
            </span>
          </div>
        </div>
      </ParallaxBanner>

      <ParallaxBanner
        image={bannerGrowth}
        alt="Busy premium salon floor seen from above with stylists and clients"
        headline="Scale Your Salon Brand With Enterprise Intelligence"
        copy="Centralized reporting, cross-branch inventory and AI forecasting for chains of any size."
        badge="Enterprise Scale"
      >
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              Centralized reporting
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              Cross-branch inventory
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              AI forecasting
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              Multi-location sync
            </span>
          </div>
        </div>
      </ParallaxBanner>

      {/* E. SALON TYPES - Redesigned */}
      <section className="relative isolate w-full overflow-hidden bg-gradient-to-b from-background to-card/50 py-24 lg:py-32">
        <SectionBackdrop variant="salon-types" />

        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          {/* Section Header */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">
                  Industry Solutions
                </span>
                <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  10+ Types
                </span>
              </div>

              <h2 className="mt-6 max-w-3xl text-4xl font-display leading-[1.05] sm:text-5xl lg:text-[3.5rem]">
                Built For{" "}
                <span className="relative">
                  <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Every Beauty Business
                  </span>
                  <motion.span
                    className="absolute -bottom-2 left-0 h-0.5 w-full bg-gradient-to-r from-primary to-purple-600"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  />
                </span>
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                From independent studios to multi-location chains — Gotix adapts
                to your business model with industry-specific workflows and
                features.
              </p>

              {/* Quick stats */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
                {[
                  { label: "Business Types", value: "9+", icon: Layers },
                  { label: "Industries", value: "8", icon: Target },
                  { label: "Happy Salons", value: "1,200+", icon: Users },
                  { label: "Success Rate", value: "97%", icon: TrendingUp },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i }}
                    className="flex items-center gap-2 rounded-full bg-card/50 px-4 py-2 backdrop-blur-sm border border-border/50"
                  >
                    <stat.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{stat.value}</span>
                    <span className="text-xs text-muted-foreground">
                      {stat.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Salon Types Grid */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {SALON_TYPES.map((type, index) => {
              const photo = SALON_TYPE_PHOTOS[type.name];
              return (
                <motion.div
                  key={type.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <Link href="/solutions" className="block h-full">
                    <div className="surface-card lift relative h-full overflow-hidden transition-all duration-300 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10">
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {photo ? (
                          <img
                            src={photo.src}
                            alt={photo.alt}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-purple-500/10">
                            <Users className="h-8 w-8 text-primary/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                        <span className="absolute bottom-2.5 left-3 right-3 font-display text-sm font-medium text-white drop-shadow-sm sm:text-base">
                          {type.name}
                        </span>
                      </div>

                      <div className="p-4">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Solution
                        </p>
                        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                          {type.desc}
                        </p>
                        <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-primary opacity-0 transition-all group-hover:opacity-100">
                          Learn more
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Featured Solution Spotlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid gap-6 md:grid-cols-3"
          >
            {[
              {
                title: "Multi-Location Chains",
                description:
                  "Centralized management for 2-50+ locations with unified reporting, inventory sync, and staff scheduling.",
                icon: Users,
                color: "from-blue-500 to-indigo-600",
                badge: "Enterprise",
              },
              {
                title: "Spa & Wellness",
                description:
                  "Room scheduling, therapist rotation, package management, and holistic client journey tracking.",
                icon: Calendar,
                color: "from-emerald-500 to-teal-600",
                badge: "Popular",
              },
              {
                title: "Bridal Studios",
                description:
                  "Multi-day itineraries, trial tracking, advance payments, and zero double-booking guarantee.",
                icon: Star,
                color: "from-rose-500 to-pink-600",
                badge: "Specialized",
              },
            ].map((solution, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6 transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20"
              >
                <div
                  className={`absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br ${solution.color} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20`}
                />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div
                      className={`rounded-xl bg-gradient-to-br ${solution.color} p-3`}
                    >
                      <solution.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
                      {solution.badge}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-medium">
                    {solution.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {solution.description}
                  </p>
                  <Link
                    href="/solutions"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-all hover:gap-2"
                  >
                    Explore solution
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative mt-16 overflow-hidden rounded-2xl border border-primary/10"
          >
            {/* Background Image */}
            <div className="absolute inset-0 -z-10">
              <img
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80"
                alt="Warm salon interior"
                className="h-full w-full object-cover brightness-95 saturate-90"
              />
              {/* Light theme overlays - keeping it bright but readable */}
              <div className="absolute inset-0 bg-gradient-to-br from-background/92 via-background/85 to-background/70" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
              {/* Subtle white overlay for light theme */}
              <div className="absolute inset-0 bg-white/10" />
              {/* Decorative gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-purple-500/5 to-transparent" />
            </div>

            <div className="relative z-10 p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Not sure which solution fits your business?
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/solutions"
                    className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25"
                  >
                    Explore All Solutions
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-6 py-3 font-medium backdrop-blur-sm transition-all hover:border-primary hover:bg-primary/5"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Talk to an Expert
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground">
                  Free consultation • Personalized demo • 14-day trial
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* F. FEATURES TEASER - Redesigned */}
      <section className="relative isolate w-full overflow-hidden py-24 lg:py-32">
        <SectionBackdrop variant="features" />

        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          {/* Section Header - Enhanced */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">
                  Core Features
                </span>
                <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  8+ Features
                </span>
              </div>

              <h2 className="mt-6 max-w-3xl text-4xl font-display leading-[1.05] sm:text-5xl lg:text-[3.5rem]">
                Everything Your Team Needs to{" "}
                <span className="relative">
                  <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Deliver Excellence
                  </span>
                  <motion.span
                    className="absolute -bottom-2 left-0 h-0.5 w-full bg-gradient-to-r from-primary to-purple-600"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  />
                </span>
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                From reception to checkout, every feature is designed to help
                your team deliver exceptional client experiences and grow your
                salon business.
              </p>

              {/* Feature stats */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
                {[
                  { label: "Features", value: "8+", icon: Layers },
                  { label: "Integrations", value: "50+", icon: Cloud },
                  { label: "Satisfaction", value: "98%", icon: Star },
                  { label: "Uptime", value: "99.9%", icon: Shield },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i }}
                    className="flex items-center gap-2 rounded-full bg-card/50 px-4 py-2 backdrop-blur-sm border border-border/50"
                  >
                    <stat.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{stat.value}</span>
                    <span className="text-xs text-muted-foreground">
                      {stat.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Features Grid - Enhanced */}
          <div className="mt-12 grid gap-8">
            {FEATURES.slice(0, 6).map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div
                  className={`group relative grid overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 lg:grid-cols-2 ${
                    index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  {/* Image/Visual Panel — Unsplash photo matched to feature */}
                  <div className="relative min-h-[280px] overflow-hidden lg:min-h-[340px]">
                    <div
                      role="img"
                      aria-label={feature.imageAlt}
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                      style={{ backgroundImage: `url(${feature.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-ink/10 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent" />

                    <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                      0{index + 1}
                    </div>
                  </div>

                  {/* Content Panel */}
                  <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-medium uppercase tracking-widest text-primary">
                        Feature
                      </span>
                      <span className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {index + 1}/{FEATURES.length}
                      </span>
                    </div>

                    <h3 className="mt-4 font-display text-2xl font-medium transition-colors group-hover:text-primary sm:text-3xl">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                      {feature.desc}
                    </p>

                    <ul className="mt-5 space-y-2.5">
                      {feature.points.map((point) => (
                        <li key={point} className="flex items-start gap-3">
                          <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <CheckCircle2 className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Learn more link */}
                    <Link
                      href="/features"
                      className="group/link mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition-all hover:gap-3"
                    >
                      Learn more about this feature
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All Features CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 text-center"
          >
            <Link
              href="/features"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30"
            >
              Explore All Features
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Feature Highlights / Why Choose */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 grid gap-6 md:grid-cols-3"
          >
            {[
              {
                icon: <Zap className="h-5 w-5" />,
                title: "Lightning Fast",
                description:
                  "Every action is optimized for speed — from booking to checkout in seconds.",
              },
              {
                icon: <Shield className="h-5 w-5" />,
                title: "Enterprise Grade",
                description:
                  "Bank-level security with ISO 27001 certification and 99.9% uptime guarantee.",
              },
              {
                icon: <Users className="h-5 w-5" />,
                title: "Team First",
                description:
                  "Built for your entire team — from receptionists to stylists and managers.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-border/50 bg-card/30 p-6 text-center backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary transition-colors group-hover:from-primary/20 group-hover:to-purple-500/20">
                  {item.icon}
                </div>
                <h4 className="font-display text-lg font-medium">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative mt-16 overflow-hidden rounded-2xl border border-primary/10"
          >
            {/* Background Image - Relevant to "Experience the Difference" */}
            <div className="absolute inset-0 -z-10">
              <img
                src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1920&q=80"
                alt="Modern salon transformation"
                className="h-full w-full object-cover brightness-[0.85] saturate-95"
              />
              {/* Overlays for text readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-background/92 via-background/85 to-background/70" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
              {/* Subtle white overlay for light theme */}
              <div className="absolute inset-0 bg-white/10" />
              {/* Decorative gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-purple-500/5 to-transparent" />
            </div>

            <div className="relative z-10 p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Ready to experience the difference?
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/signup"
                    className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25"
                  >
                    Start Free Trial
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/demo"
                    className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-6 py-3 font-medium backdrop-blur-sm transition-all hover:border-primary hover:bg-primary/5"
                  >
                    <Calendar className="h-4 w-4" />
                    Book a Demo
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground">
                  No credit card required • Free 14-day trial • 24/7 support
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* G. AI TEASER - Redesigned */}
      {/* G. AI TEASER - Redesigned with Icons */}
      <section className="relative w-full overflow-hidden py-24 lg:py-32 gradient-ink text-ink-foreground">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />

          {/* Animated grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          {/* Section Header - Enhanced */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span className="text-xs font-medium text-gold">
                  AI-Powered Intelligence
                </span>
                <span className="ml-1 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-gold">
                  Beta
                </span>
              </div>

              <h2 className="mt-6 max-w-3xl text-4xl font-display leading-[1.05] text-ink-foreground sm:text-5xl lg:text-[3.5rem]">
                AI That{" "}
                <span className="relative">
                  <span className="bg-gradient-to-r from-gold to-yellow-500 bg-clip-text text-transparent">
                    Understands Your Salon
                  </span>
                  <motion.span
                    className="absolute -bottom-2 left-0 h-0.5 w-full bg-gradient-to-r from-gold to-yellow-500"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  />
                </span>
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-foreground/70 sm:text-lg">
                Predictive analytics, smart scheduling, and automated insights
                that help you grow revenue while delivering exceptional client
                experiences — all powered by advanced AI.
              </p>

              {/* AI Stats with icons */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
                {[
                  { label: "Accuracy", value: "94%", icon: Target },
                  { label: "Predictions", value: "12.5K", icon: TrendingUp },
                  { label: "Time Saved", value: "15hrs", icon: Clock },
                  { label: "Uptime", value: "99.9%", icon: Shield },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i }}
                    className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 backdrop-blur-sm border border-white/10"
                  >
                    <stat.icon className="h-4 w-4 text-gold" />
                    <span className="text-sm font-medium text-ink-foreground">
                      {stat.value}
                    </span>
                    <span className="text-xs text-ink-foreground/60">
                      {stat.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* AI Cards Grid - Enhanced with Icons */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {AI_CARDS.map((card, index) => {
              const cardIcons = [
                <Target className="h-6 w-6 text-gold" />,
                <TrendingUp className="h-6 w-6 text-gold" />,
                <Zap className="h-6 w-6 text-gold" />,
                <Package className="h-6 w-6 text-gold" />,
              ];
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-gold/50 hover:shadow-xl hover:shadow-gold/10">
                    {/* Glow effect on hover */}
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/5 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                    {/* Card number */}
                    <div className="absolute right-4 top-4 text-[10px] font-medium text-ink-foreground/20">
                      {(index + 1).toString().padStart(2, "0")}
                    </div>

                    <div className="relative">
                      {/* Icon with gradient */}
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-yellow-500/20 transition-all duration-300 group-hover:scale-110 group-hover:from-gold/30 group-hover:to-yellow-500/30">
                        {cardIcons[index]}
                      </div>

                      <h3 className="mt-4 font-display text-lg text-ink-foreground transition-colors group-hover:text-gold">
                        {card.title}
                      </h3>

                      <p className="mt-2 text-sm leading-relaxed text-ink-foreground/65">
                        {card.desc}
                      </p>

                      {/* Learn more indicator */}
                      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gold/60 opacity-0 transition-all group-hover:opacity-100">
                        Learn more
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* AI Feature Highlights with Icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid gap-6 md:grid-cols-3"
          >
            {[
              {
                icon: <Zap className="h-5 w-5 text-gold" />,
                title: "Real-Time Insights",
                description:
                  "Get instant recommendations for staffing, inventory, and pricing based on live data.",
              },
              {
                icon: <TrendingUp className="h-5 w-5 text-gold" />,
                title: "Revenue Optimization",
                description:
                  "Identify upsell opportunities, pricing gaps, and service performance trends.",
              },
              {
                icon: <Users className="h-5 w-5 text-gold" />,
                title: "Client Intelligence",
                description:
                  "Predict client behavior, preferences, and churn risk with AI-powered analytics.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm transition-all hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold/10 to-yellow-500/10 transition-colors group-hover:from-gold/20 group-hover:to-yellow-500/20">
                  {item.icon}
                </div>
                <h4 className="font-display text-lg text-ink-foreground">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm text-ink-foreground/60">
                  {item.description}
                </p>
              </div>
            ))}
          </motion.div>

          {/* CTA with normal buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 p-8 text-center border border-white/10 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold" />
                <span className="text-sm font-medium text-gold">
                  Ready to harness the power of AI?
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/ai" className="btn-base btn-gold">
                  Explore AI Analytics <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/demo"
                  className="btn-base border border-white/20 bg-white/5 text-ink-foreground hover:bg-white/10 hover:border-gold/50"
                >
                  <Calendar className="h-4 w-4" />
                  Book a Demo
                </Link>
              </div>
              <p className="text-xs text-ink-foreground/50">
                No credit card required • Free 14-day trial • 24/7 support
              </p>
            </div>
          </motion.div>

          {/* Trust indicators with icons */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-center"
          >
            {[
              {
                icon: Shield,
                label: "Enterprise Security",
                sub: "ISO 27001 certified",
              },
              {
                icon: Zap,
                label: "Real-time Processing",
                sub: "< 100ms response",
              },
              {
                icon: Award,
                label: "AI Excellence",
                sub: "2024 Innovation Award",
              },
              {
                icon: Headphones,
                label: "24/7 Support",
                sub: "Dedicated AI experts",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="rounded-full bg-white/5 p-2 border border-white/10">
                  <item.icon className="h-4 w-4 text-gold" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-ink-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-ink-foreground/50">{item.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* H. TESTIMONIALS - Redesigned with Auto-Slide Carousel */}
      <section className="relative isolate w-full overflow-hidden py-24 lg:py-32">
        <SectionBackdrop variant="testimonials" />

        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          {/* Section Header */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
                <Star className="h-3.5 w-3.5 text-gold" />
                <span className="text-xs font-medium text-primary">
                  Testimonials
                </span>
                <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  4.9★
                </span>
              </div>

              <h2 className="mt-6 max-w-3xl text-4xl font-display leading-[1.05] sm:text-5xl lg:text-[3.5rem]">
                Loved By{" "}
                <span className="relative">
                  <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Salons Across India
                  </span>
                  <motion.span
                    className="absolute -bottom-2 left-0 h-0.5 w-full bg-gradient-to-r from-primary to-purple-600"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  />
                </span>
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Real stories from salon owners who transformed their business
                with Gotix.
              </p>

              {/* Rating summary */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
                <div className="flex items-center gap-3 rounded-full bg-card/50 px-4 py-2 backdrop-blur-sm border border-border/50">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">4.9/5</span>
                  <span className="text-xs text-muted-foreground">
                    (1,200+ reviews)
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Testimonials Carousel */}
          <div className="relative mt-12 overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{
                x: [0, -100, -200, -300],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              onHoverStart={() => {
                // Pause animation on hover
                const track = document.querySelector(
                  ".testimonials-track",
                ) as HTMLElement | null;
                track?.style.setProperty("animation-play-state", "paused");
              }}
              onHoverEnd={() => {
                // Resume animation on hover end
                const track = document.querySelector(
                  ".testimonials-track",
                ) as HTMLElement | null;
                track?.style.setProperty("animation-play-state", "running");
              }}
            >
              {/* Duplicate testimonials for seamless loop */}
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, index) => (
                <motion.div
                  key={`${t.name}-${index}`}
                  className="min-w-[280px] flex-1 sm:min-w-[320px] lg:min-w-[340px]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <div className="group h-full rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      “{t.quote}”
                    </blockquote>

                    {/* Author */}
                    <figcaption className="mt-6 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 font-display text-lg font-medium text-primary">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <span className="block font-display text-sm font-medium">
                          {t.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {t.role}
                        </span>
                      </div>
                    </figcaption>

                    {/* Verified badge */}
                    <div className="mt-4 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span className="text-[10px] text-muted-foreground">
                        Verified Review
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Gradient overlays for smooth edges */}
            <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-background to-transparent pointer-events-none" />
          </div>

          {/* Navigation dots */}
          <div className="mt-8 flex justify-center gap-2">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                className="h-2 w-2 rounded-full bg-muted-foreground/30 transition-all hover:bg-primary/50"
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {[
              { value: "1,200+", label: "Salons", icon: Users },
              { value: "4.9★", label: "Average Rating", icon: Star },
              { value: "50K+", label: "Appointments", icon: Calendar },
              { value: "98%", label: "Satisfaction", icon: TrendingUp },
            ].map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/50 bg-card/30 p-6 text-center backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              >
                <stat.icon className="mx-auto h-5 w-5 text-primary" />
                <p className="mt-2 font-display text-2xl font-bold">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative mt-16 overflow-hidden rounded-2xl border border-primary/10"
          >
            {/* Background Image - Community/Happy Salons */}
            <div className="absolute inset-0 -z-10">
              <img
                src="https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1920&q=80"
                alt="Happy salon team and community"
                className="h-full w-full object-cover brightness-[0.85] saturate-95"
              />
              {/* Overlays for text readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-background/92 via-background/85 to-background/70" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-white/10" />
              {/* Decorative gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-purple-500/5 to-transparent" />
            </div>

            <div className="relative z-10 p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Join 1,200+ happy salons
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/signup"
                    className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25"
                  >
                    Start Free Trial
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/testimonials"
                    className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-6 py-3 font-medium backdrop-blur-sm transition-all hover:border-primary hover:bg-primary/5"
                  >
                    <Users className="h-4 w-4" />
                    Read More Stories
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground">
                  Join the community of successful salon owners
                </p>
              </div>
            </div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-center"
          >
            {[
              { icon: Shield, label: "Trusted", sub: "1,200+ salons" },
              {
                icon: Award,
                label: "Award Winning",
                sub: "Best Salon Software 2024",
              },
              {
                icon: Headphones,
                label: "24/7 Support",
                sub: "Dedicated team",
              },
              { icon: Zap, label: "Fast Setup", sub: "< 24 hours" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* I. PRICING PREVIEW - Redesigned */}
      <section className="relative isolate w-full overflow-hidden bg-card py-24 lg:py-32">
        <SectionBackdrop variant="pricing" fadeFrom="card" />

        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          {/* Section Header - Enhanced */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">
                  Pricing
                </span>
                <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Simple Plans
                </span>
              </div>

              <h2 className="mt-6 max-w-3xl text-4xl font-display leading-[1.05] sm:text-5xl lg:text-[3.5rem]">
                Plans That{" "}
                <span className="relative">
                  <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Grow With You
                  </span>
                  <motion.span
                    className="absolute -bottom-2 left-0 h-0.5 w-full bg-gradient-to-r from-primary to-purple-600"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  />
                </span>
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Choose the perfect plan for your salon. Upgrade or downgrade
                anytime with no hidden fees.
              </p>
            </motion.div>
          </div>

          {/* Pricing Cards Grid - Only 2 plans */}
          <div className="mt-12 grid max-w-3xl gap-6 mx-auto md:grid-cols-2">
            {PLANS.filter(
              (plan) => plan.name === "Starter" || plan.name === "Professional",
            ).map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div
                  className={`home-pricing-card relative h-full overflow-hidden rounded-2xl border p-8 ${
                    plan.popular
                      ? "home-pricing-card-pro bg-gradient-to-b from-primary/5 to-transparent"
                      : "home-pricing-card-starter border-border/50 bg-card/50"
                  }`}
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
                      className={`rounded-lg p-2.5 transition-colors duration-500 ${
                        plan.popular
                          ? "bg-primary/10 group-hover:bg-primary/15"
                          : "bg-muted/50 group-hover:bg-primary/10"
                      }`}
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
                      ₹{plan.monthly?.toLocaleString("en-IN")}
                      <span className="ml-1 text-base font-normal text-muted-foreground">
                        /mo
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Billed monthly • Cancel anytime
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
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-[background-color,border-color,box-shadow,color] duration-500 ${
                        plan.popular
                          ? "bg-primary text-primary-foreground group-hover:bg-primary-dark group-hover:shadow-lg group-hover:shadow-primary/25"
                          : "border border-border/50 bg-background/50 text-foreground group-hover:border-primary/40 group-hover:bg-primary/5 group-hover:shadow-[0_0_20px_-10px] group-hover:shadow-primary/15"
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All Pricing */}
          <Reveal className="mt-10 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 font-medium text-primary transition-all hover:gap-3"
            >
              See Full Pricing Details <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          {/* Trust/Guarantee Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid gap-6 md:grid-cols-3"
          >
            {[
              {
                icon: <Shield className="h-5 w-5 text-primary" />,
                title: "No Hidden Fees",
                description:
                  "Transparent pricing with no setup costs or surprise charges.",
              },
              {
                icon: <Zap className="h-5 w-5 text-primary" />,
                title: "Free Data Migration",
                description:
                  "We'll migrate your data from any platform at no extra cost.",
              },
              {
                icon: <Headphones className="h-5 w-5 text-primary" />,
                title: "24/7 Support",
                description:
                  "Dedicated support team available around the clock.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/50 bg-card/30 p-6 text-center backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10">
                  {item.icon}
                </div>
                <h4 className="font-display text-lg font-medium">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </motion.div>

          {/* FAQ Teaser */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative mt-16 overflow-hidden rounded-2xl border border-primary/10"
          >
            {/* Background Image - Pricing/Finance Related */}
            <div className="absolute inset-0 -z-10">
              <img
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1920&q=80"
                alt="Financial planning and pricing consultation"
                className="h-full w-full object-cover brightness-[0.85] saturate-90"
              />
              {/* Overlays for text readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-background/92 via-background/85 to-background/70" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-white/10" />
              {/* Decorative gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-purple-500/5 to-transparent" />
            </div>

            <div className="relative z-10 p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <p className="text-sm font-medium text-primary">
                    Have questions about pricing?
                  </p>
                </div>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 font-medium text-primary transition-all hover:gap-3"
                >
                  Visit our FAQ page
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="text-xs text-muted-foreground">
                  Or contact our sales team for custom enterprise pricing
                </p>
              </div>
            </div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-center"
          >
            {[
              { icon: Shield, label: "Secure Payments", sub: "PCI compliant" },
              { icon: Award, label: "Best Value", sub: "2024 award winner" },
              { icon: Users, label: "1,200+ Salons", sub: "Trusted worldwide" },
              {
                icon: Zap,
                label: "14-Day Trial",
                sub: "No credit card required",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* J. FAQ TEASER */}
      {/* J. FAQ TEASER - Redesigned */}
      <section className="relative isolate w-full overflow-hidden py-24 lg:py-32">
        <SectionBackdrop variant="faq" />

        <div className="relative z-10 mx-auto w-full max-w-4xl px-5 sm:px-8">
          {/* Section Header - Enhanced */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">FAQ</span>
                <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Help Center
                </span>
              </div>

              <h2 className="mt-6 max-w-3xl text-4xl font-display leading-[1.05] sm:text-5xl lg:text-[3.5rem]">
                Questions?{" "}
                <span className="relative">
                  <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    We've Got Answers
                  </span>
                  <motion.span
                    className="absolute -bottom-2 left-0 h-0.5 w-full bg-gradient-to-r from-primary to-purple-600"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  />
                </span>
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Everything you need to know about Gotix. Can't find what you're
                looking for? Feel free to contact our support team.
              </p>

              {/* Quick stats */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
                {[
                  { label: "FAQs", value: "8+", icon: Layers },
                  { label: "Response Time", value: "< 2hrs", icon: Zap },
                  { label: "Support", value: "24/7", icon: Headphones },
                  { label: "Satisfaction", value: "98%", icon: Star },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i }}
                    className="flex items-center gap-2 rounded-full bg-card/50 px-4 py-2 backdrop-blur-sm border border-border/50"
                  >
                    <stat.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{stat.value}</span>
                    <span className="text-xs text-muted-foreground">
                      {stat.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* FAQ Accordion - short answers + direct setup actions */}
          <div className="mt-12 space-y-3">
            {[
              {
                q: "How quickly can I set up Gotix?",
                a: "Most salons go live the same day. Create your account and start setup now.",
                actions: [
                  { label: "Sign up free", href: "/signup", primary: true },
                  { label: "Log in", href: "/login", primary: false },
                ],
              },
              {
                q: "Do you offer a free trial?",
                a: "Yes — 14 days, full access, no credit card required.",
                actions: [
                  { label: "Start free trial", href: "/signup", primary: true },
                  { label: "Log in", href: "/login", primary: false },
                ],
              },
              {
                q: "Can I migrate from my current software?",
                a: "Yes. Free migration from Fresha, Booksy, Zoho, or Excel — we handle it for you.",
                actions: [
                  { label: "Sign up to migrate", href: "/signup", primary: true },
                  { label: "Book a demo", href: "/demo", primary: false },
                ],
              },
              {
                q: "Is there a setup fee?",
                a: "No. Setup, onboarding, and staff training are included.",
                actions: [
                  { label: "Create account", href: "/signup", primary: true },
                  { label: "Log in", href: "/login", primary: false },
                ],
              },
            ].map((faq, index) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group rounded-2xl border border-border/50 bg-card/30 p-5 backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 sm:p-6"
              >
                <details className="group/details" open={index === 0}>
                  <summary className="flex cursor-pointer items-center justify-between gap-4 list-none">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {index + 1}
                      </div>
                      <h3 className="font-display text-base font-medium transition-colors group-hover/details:text-primary">
                        {faq.q}
                      </h3>
                    </div>
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted/50 transition-all group-hover/details:bg-primary/10">
                      <ChevronDown className="h-4 w-4 transition-transform duration-300 group-open/details:rotate-180" />
                    </div>
                  </summary>
                  <div className="mt-4 pl-9">
                    <div className="rounded-xl border border-border/40 bg-background/70 p-4">
                      <p className="text-sm font-medium leading-relaxed text-foreground">
                        {faq.a}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {faq.actions.map((action) => (
                          <Link
                            key={action.href + action.label}
                            href={action.href}
                            className={
                              action.primary
                                ? "inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-dark sm:text-sm"
                                : "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary/5 sm:text-sm"
                            }
                          >
                            {action.label}
                            {action.primary ? <ArrowRight className="h-3.5 w-3.5" /> : null}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </details>
              </motion.div>
            ))}
          </div>

          {/* View All FAQs */}
          <Reveal className="mt-10 text-center">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 font-medium text-primary transition-all hover:gap-3"
            >
              View All FAQs <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          {/* Still have questions? */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative mt-16 overflow-hidden rounded-2xl border border-primary/10"
          >
            {/* Background Image - Customer Support/Help Desk Related */}
            <div className="absolute inset-0 -z-10">
              <img
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1920&q=80"
                alt="Help desk support"
                className="h-full w-full object-cover brightness-[0.85] saturate-90"
              />
              {/* Overlays for text readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-background/92 via-background/85 to-background/70" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-white/10" />
              {/* Decorative gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-purple-500/5 to-transparent" />
            </div>

            <div className="relative z-10 p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Still have questions?
                  </span>
                </div>
                <p className="max-w-md text-sm text-muted-foreground">
                  Our team is here to help. Get in touch and we'll get back to
                  you within 2 hours.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/contact"
                    className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25"
                  >
                    Contact Support
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/demo"
                    className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-6 py-3 font-medium backdrop-blur-sm transition-all hover:border-primary hover:bg-primary/5"
                  >
                    <Calendar className="h-4 w-4" />
                    Book a Demo
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick links / Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-3"
          >
            <span className="text-xs font-medium text-muted-foreground">
              Popular topics:
            </span>
            {[
              "Getting Started",
              "Billing",
              "Features",
              "Integrations",
              "Security",
            ].map((topic) => (
              <Link
                key={topic}
                href="/faq"
                className="rounded-full border border-border/50 bg-card/30 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                {topic}
              </Link>
            ))}
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-center"
          >
            {[
              { icon: Shield, label: "Secure", sub: "Encrypted data" },
              { icon: Zap, label: "Fast Support", sub: "Average 2hr response" },
              {
                icon: Award,
                label: "Expert Team",
                sub: "Dedicated specialists",
              },
              { icon: Headphones, label: "24/7", sub: "Round the clock" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}

export default HomePageView;
