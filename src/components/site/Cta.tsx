"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Shield,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";

export function CtaBanner({
  title = "Ready to transform your salon?",
  copy = "Start your 14-day free trial — every module, no credit card, onboarding included.",
}: {
  title?: string;
  copy?: string;
}) {
  return (
    <section className="relative w-full overflow-hidden py-20 sm:py-24 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-3xl" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="mx-auto w-full max-w-[1500px] px-5 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-1.5 backdrop-blur-sm shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Get Started</span>
            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              Free Trial
            </span>
          </div>

          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-display leading-tight text-foreground sm:text-4xl lg:text-5xl">
            {title}
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {copy}
          </p>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="hidden h-4 w-px bg-border sm:block" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>14-day free trial</span>
            </div>
            <div className="hidden h-4 w-px bg-border sm:block" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 text-blue-500" />
              <span>1,200+ happy salons</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-white px-8 py-3.5 font-medium text-foreground transition-all hover:border-primary hover:bg-primary/5 hover:shadow-lg"
            >
              <Calendar className="h-4 w-4" />
              Book a Demo
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-8 flex items-center justify-center gap-6">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-primary/30 to-purple-500/30"
                />
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-1 text-sm font-medium">4.9/5</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Trusted by <span className="font-semibold text-foreground">1,200+</span> salon
                owners
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-border rounded-2xl border border-border/50 bg-white/50 p-2 backdrop-blur-sm">
      {items.map((item, index) => (
        <motion.div
          key={item.q}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="group rounded-xl transition-colors hover:bg-muted/30"
        >
          <details className="px-4 py-4">
            <summary className="flex cursor-pointer items-center justify-between gap-4 list-none">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {index + 1}
                </div>
                <h3 className="font-display text-base font-medium text-foreground transition-colors group-hover:text-primary">
                  {item.q}
                </h3>
              </div>
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted/50 transition-all group-hover:bg-primary/10">
                <span className="text-xl font-light text-primary transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </div>
            </summary>
            <div className="mt-3 pl-9">
              <div className="rounded-lg bg-muted/20 p-4">
                <p className="text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </div>
            </div>
          </details>
        </motion.div>
      ))}
    </div>
  );
}

export function RatingBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center gap-4 rounded-2xl border border-border/50 bg-white/80 px-5 py-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
    >
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="text-left">
        <p className="text-sm font-bold text-foreground">4.9/5</p>
        <p className="text-xs text-muted-foreground">from 847 reviews</p>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="flex items-center gap-1.5">
        <Shield className="h-4 w-4 text-green-500" />
        <span className="text-xs font-medium text-muted-foreground">Verified</span>
      </div>
    </motion.div>
  );
}

// Optional: Additional component for displaying featured testimonials
export function TestimonialFeatured() {
  return (
    <div className="rounded-2xl border border-border/50 bg-white/50 p-6 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 text-lg font-display text-primary">
          PS
        </div>
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">5.0</span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            "Gotix transformed how we manage our salon. Revenue is up 40%!"
          </p>
          <p className="mt-2 text-xs font-medium text-foreground">Priya Sharma</p>
          <p className="text-xs text-muted-foreground">Luxe Hair Studio, Mumbai</p>
        </div>
      </div>
    </div>
  );
}
