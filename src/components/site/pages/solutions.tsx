"use client";

import { CtaBanner } from "@/components/site/Cta";
import { Reveal } from "@/components/site/Reveal";
import { SALON_TYPES } from "@/lib/site-data";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  Gem,
  Hand,
  Paintbrush,
  Palette,
  Scissors,
  Shield,
  Smartphone,
  Sparkles,
  SprayCan,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";

const bannerGrowth = "/gotix/banner-growth.jpg";

function unsplash(id: string, w = 1600) {
  return `https://images.unsplash.com/${id}?w=${w}&q=85&auto=format&fit=crop`;
}

// Verified Unsplash photography — keys match SALON_TYPES names lowercased
const TYPE_PHOTOS: Record<string, string> = {
  "hair salon": unsplash("photo-1562322140-8baeececf3df"),
  "beauty salon": unsplash("photo-1560066984-138dadb4c035"),
  spa: unsplash("photo-1544161515-4ab6ce6db874"),
  "skin clinic": unsplash("photo-1570172619644-dfd03ed5d881"),
  "barber shop": unsplash("photo-1600948836101-f9ffda59d250"),
  "nail studio": unsplash("photo-1706629503571-c165023a7792"),
  "makeup studio": unsplash("photo-1515377905703-c4788e51af15"),
  "bridal studio": unsplash("photo-1512496015851-a90fb38ba796"),
  "tattoo studio": unsplash("photo-1558618666-fcd25c85cd64"),
};

function typeSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

const HERO_MOSAIC = SALON_TYPES.filter((t) => t.name !== "Nail Studio")
  .slice(0, 5)
  .map((t) => ({
    name: t.name,
    slug: typeSlug(t.name),
    photo: TYPE_PHOTOS[t.name.toLowerCase()] ?? bannerGrowth,
  }));

const MOSAIC_LAYOUTS = [
  "lg:col-span-4 lg:row-span-3 lg:row-start-1 lg:col-start-1",
  "lg:col-span-2 lg:row-span-2 lg:row-start-1 lg:col-start-5",
  "lg:col-span-2 lg:row-span-2 lg:row-start-3 lg:col-start-5",
  "lg:col-span-2 lg:row-span-2 lg:row-start-5 lg:col-start-5",
  "lg:col-span-4 lg:row-span-3 lg:row-start-4 lg:col-start-1",
];

const HERO_STATS = [
  { value: String(SALON_TYPES.length), label: "Business types" },
  { value: "22+", label: "Modules included" },
  { value: "1 day", label: "To go live" },
  { value: "4.9★", label: "Avg. rating" },
];

const TYPE_ICONS: Record<string, any> = {
  "Hair Salon": Scissors,
  "Beauty Salon": SprayCan,
  Spa: Hand,
  "Skin Clinic": Sparkles,
  "Barber Shop": Scissors,
  "Nail Studio": Paintbrush,
  "Makeup Studio": Palette,
  "Bridal Studio": Gem,
  "Tattoo Studio": Sparkles,
};

// Rotating gradient set for types without a confirmed photo yet
const GRADIENTS = [
  "from-primary/90 via-primary/60 to-purple-600/80",
  "from-purple-600/90 via-primary/55 to-teal-500/70",
  "from-teal-500/90 via-emerald-500/50 to-primary/70",
];

const ADAPTS_TO = [
  { icon: Calendar, label: "Booking flow matched to your service length" },
  { icon: Palette, label: "Branded client app, receipts & reminders" },
  { icon: Smartphone, label: "Staff app tuned to your floor's workflow" },
];

function TypeCardArt({ name, index }: { name: string; index: number }) {
  const photo = TYPE_PHOTOS[name.toLowerCase()];
  if (photo) {
    return (
      <img
        src={photo}
        alt={`${name} workspace`}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
    );
  }
  return (
    <div
      className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} transition duration-500 group-hover:scale-105`}
    />
  );
}

function SolutionsPage() {
  return (
    <>
      {/* ============ HERO — 100vh bento mosaic ============ */}
      <section className="relative flex h-[100svh] max-h-[100svh] w-full flex-col overflow-hidden border-b border-border/60 bg-background pt-[4.5rem] pb-3 sm:pt-[5rem] sm:pb-4">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--foreground) 8%, transparent) 1px, transparent 0)",
              backgroundSize: "26px 26px",
            }}
          />
          <div className="absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_75%_55%_at_50%_-5%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent)]" />
          <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-purple-500/8 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-primary/8 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 flex-col px-5 sm:px-8">
          <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-stretch lg:gap-8">
            {/* Copy column */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="flex flex-col justify-center"
            >
              <span className="eyebrow inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Solutions
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {SALON_TYPES.length} types
                </span>
              </span>

              <h1 className="mt-4 font-display text-[1.9rem] leading-[1.05] sm:text-4xl lg:text-[2.85rem]">
                Built for every kind of{" "}
                <em className="italic text-primary">beauty business.</em>
              </h1>

              <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                Hair, spa, skin, nails, bridal, tattoo and more — Gotix ships
                with workflows, booking rules and billing presets tuned to how
                your floor actually runs.
              </p>

              <ul className="mt-4 space-y-2">
                {[
                  "Industry-specific booking & checkout flows",
                  "Preset service menus you can customize in minutes",
                  "Multi-branch ready from day one",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-foreground/80"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/demo"
                  className="group btn-base btn-primary !px-4 !py-2 text-sm"
                >
                  Find my fit
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#types"
                  className="btn-base btn-outline !px-4 !py-2 text-sm"
                >
                  Browse all types
                </Link>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="h-3 w-3 fill-amber-400 text-amber-400"
                    />
                  ))}
                  <span className="ml-1 font-medium text-foreground">
                    1,200+ salons
                  </span>
                </div>
                <span className="hidden h-3 w-px bg-border sm:block" />
                <span className="inline-flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 text-primary" /> Enterprise
                  grade
                </span>
                <span className="hidden h-3 w-px bg-border sm:block" />
                <span className="inline-flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-amber-500" /> 99.9% uptime
                </span>
              </div>
            </motion.div>

            {/* Photo mosaic column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid h-[34svh] min-h-[220px] shrink-0 grid-cols-2 grid-rows-[repeat(3,minmax(0,1fr))] gap-2 sm:grid-cols-3 sm:grid-rows-[repeat(2,minmax(0,1fr))] sm:h-[38svh] lg:h-full lg:min-h-[320px] lg:grid-cols-6 lg:grid-rows-[repeat(6,minmax(0,1fr))] lg:gap-2.5"
            >
              {HERO_MOSAIC.map((item, i) => {
                const mobileSpan =
                  i === 4 ? "col-span-2 sm:col-span-1" : "col-span-1";
                return (
                  <a
                    key={item.name}
                    href={`#type-${item.slug}`}
                    className={`group relative h-full min-h-0 overflow-hidden rounded-2xl border border-border/70 bg-muted/20 shadow-sm ${mobileSpan} ${MOSAIC_LAYOUTS[i]}`}
                  >
                    <img
                      src={item.photo}
                      alt={item.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
                      <p className="text-[9px] uppercase tracking-[0.14em] text-white/65">
                        0{i + 1}
                      </p>
                      <p className="font-display text-sm leading-tight text-white sm:text-base">
                        {item.name}
                      </p>
                    </div>
                    <span className="absolute right-2 top-2 rounded-full bg-white/15 p-1 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </a>
                );
              })}
            </motion.div>
          </div>

          {/* Bottom strip: stats + type pills */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 shrink-0 space-y-2 sm:mt-4"
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {HERO_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-center backdrop-blur-sm"
                >
                  <p className="font-display text-lg sm:text-xl">
                    {stat.value}
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {SALON_TYPES.map((t) => (
                <a
                  key={t.name}
                  href={`#type-${typeSlug(t.name)}`}
                  className="shrink-0 rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                >
                  {t.name}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ QUICK-BROWSE CARD GRID ============ */}
      <section id="types" className="w-full py-24">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Pick a starting point</p>
                <h2 className="mt-3 text-3xl sm:text-4xl">
                  Every type, one tap away.
                </h2>
              </div>
              <p className="max-w-sm text-sm text-muted-foreground">
                Jump straight to the setup built for your business, or scroll
                through all of them below.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {SALON_TYPES.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.04}>
                <a
                  href={`#type-${typeSlug(t.name)}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-border"
                >
                  <TypeCardArt name={t.name} index={i} />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">
                      0{i + 1}
                    </p>
                    <p className="mt-1 font-display text-base leading-tight text-white">
                      {t.name}
                    </p>
                  </div>
                  <span className="absolute right-3 top-3 flex h-8 w-8 translate-y-1 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ADAPTS TO YOUR FLOOR ============ */}
      <section className="w-full border-y border-border bg-card py-20">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">
                  Adaptable
                </span>
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl">
                It adapts to you — not the other way round.
              </h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                Whichever type you run, the underlying setup adjusts to match
                how your team actually books, bills, and follows up.
              </p>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-3">
              {ADAPTS_TO.map(({ icon: Icon, label }, i) => (
                <Reveal key={label} delay={i * 0.08}>
                  <div className="h-full rounded-2xl border border-border bg-background p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                      {label}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ DETAILED, ALTERNATING SECTIONS PER TYPE ============ */}
      {SALON_TYPES.map((t, i) => {
        const IconComponent = TYPE_ICONS[t.name] || Building2;
        return (
          <section
            key={t.name}
            id={`type-${typeSlug(t.name)}`}
            className={`relative w-full scroll-mt-24 overflow-hidden py-20 ${
              i % 2 === 1 ? "bg-card" : "bg-background"
            }`}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
              <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
            </div>

            <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
              <Reveal>
                <div
                  className={`grid items-center gap-12 lg:grid-cols-2 ${
                    i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div className="relative overflow-hidden rounded-3xl border border-border">
                    <div className="relative aspect-[5/4] w-full">
                      {TYPE_PHOTOS[t.name.toLowerCase()] ? (
                        <img
                          src={TYPE_PHOTOS[t.name.toLowerCase()]}
                          alt={`${t.name} interior photo`}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition duration-700 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-purple-500/10">
                          <IconComponent className="h-20 w-20 text-primary/30" />
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-card/60 via-transparent to-transparent" />

                      {/* Badge */}
                      <div className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                        {i + 1 < 10 ? `0${i + 1}` : i + 1} /{" "}
                        {SALON_TYPES.length}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <p className="eyebrow">Solution</p>
                    </div>
                    <h2 className="mt-3 text-3xl sm:text-4xl">{t.name}</h2>
                    <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-primary to-purple-600" />
                    <p className="mt-4 max-w-lg text-muted-foreground">
                      {t.desc}
                    </p>

                    {/* Feature chips */}
                    <div className="mt-6 flex flex-wrap gap-2">
                      {[
                        "Custom Workflow",
                        "Industry-Specific",
                        "Scalable",
                        "Automated",
                      ].map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full border border-border/50 bg-background/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                      <Link
                        href="/features"
                        className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-all hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25"
                      >
                        Learn more{" "}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                      <Link
                        href="/demo"
                        className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-6 py-2.5 font-medium backdrop-blur-sm transition-all hover:border-primary hover:bg-primary/5"
                      >
                        See a {t.name.toLowerCase()} demo
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        );
      })}

      <CtaBanner title="Find the right fit for your business." />
    </>
  );
}

export default SolutionsPage;
