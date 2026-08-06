"use client";

import { CtaBanner } from "@/components/site/Cta";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { PageHero } from "@/components/site/Sections";
import { AI_CARDS } from "@/lib/site-data";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  Clock,
  Shield,
  Zap,
  Award,
  Users,
  Calendar,
  BarChart3,
  Brain,
  Lightbulb,
  PieChart,
  Activity,
  CheckCircle2,
  Star,
} from "lucide-react";

const aiHero = "/gotix/ai-hero.jpg";

const TITLE = "AI Analytics for Salons — Gotix";
const DESC =
  "Demand forecasting, smart service recommendations, revenue optimization and inventory intelligence — AI that understands your salon.";

const BARS = [42, 58, 35, 76, 64, 92, 71];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const AI_STATS = [
  { value: "94%", label: "Forecast Accuracy", icon: Target },
  { value: "12.5K", label: "Predictions Made", icon: TrendingUp },
  { value: "15hrs", label: "Time Saved Weekly", icon: Clock },
  { value: "99.9%", label: "Uptime", icon: Shield },
];

const AI_FEATURES = [
  {
    icon: Brain,
    title: "Smart Predictions",
    description: "AI forecasts demand, staffing needs, and revenue trends with 94% accuracy.",
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500",
  },
  {
    icon: Lightbulb,
    title: "Intelligent Insights",
    description: "Get actionable recommendations for pricing, services, and client engagement.",
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-500",
  },
  {
    icon: PieChart,
    title: "Revenue Optimization",
    description: "Identify upsell opportunities and pricing gaps to maximize profitability.",
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
  },
  {
    icon: Activity,
    title: "Real-time Analytics",
    description: "Monitor key metrics with live dashboards and instant performance alerts.",
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Owner, Luxe Hair Studio",
    quote: "The AI analytics helped us identify our most profitable services and peak hours.",
    rating: 5,
  },
  {
    name: "Raj Malhotra",
    role: "Director, The Groom Room",
    quote: "Forecasting accuracy is incredible. We've reduced overstaffing by 40%.",
    rating: 5,
  },
];

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

      {/* Quick Stats Section */}
      <section className="relative w-full overflow-hidden border-y border-border/60 bg-background/50 py-8 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {AI_STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 rounded-xl bg-card/50 p-4 backdrop-blur-sm border border-border/50"
              >
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Cards Grid */}
      <section className="relative w-full overflow-hidden py-24 lg:py-32 bg-gradient-to-b from-background via-card/30 to-background">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">AI Capabilities</span>
              <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                4 Modules
              </span>
            </div>
            <h2 className="mt-6 text-3xl font-display sm:text-4xl lg:text-5xl">
              Intelligence That{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Drives Growth
              </span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Every AI feature is designed to help you make smarter decisions, save time, and grow revenue.
            </p>
          </motion.div>

          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {AI_CARDS.map((c, index) => (
              <StaggerItem key={c.title}>
                <motion.div
                  className="group relative h-full overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:-translate-y-2 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                  
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 transition-all duration-300 group-hover:scale-110">
                      <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-purple-500" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-medium text-foreground transition-colors group-hover:text-primary">
                      {c.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {c.desc}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary/60 opacity-0 transition-all group-hover:opacity-100">
                      Learn more
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* AI Features Grid */}
      <section className="relative w-full overflow-hidden py-24 bg-card/30">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Features</span>
            </div>
            <h3 className="mt-6 text-2xl font-display sm:text-3xl lg:text-4xl">
              AI-Powered{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Business Intelligence
              </span>
            </h3>
          </motion.div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {AI_FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group rounded-2xl bg-gradient-to-br ${feature.color} border border-border/50 p-6 backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1`}
              >
                <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 ${feature.iconColor} transition-colors group-hover:from-primary/20 group-hover:to-purple-500/20`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h4 className="font-display text-center text-lg font-medium">{feature.title}</h4>
                <p className="mt-2 text-center text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Forecast Chart Section */}
      <section className="relative w-full overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Forecast</span>
              <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Live
              </span>
            </div>
            <h3 className="mt-6 text-2xl font-display sm:text-3xl lg:text-4xl">
              Predicted Demand{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Next 7 Days
              </span>
            </h3>
          </motion.div>

          <Reveal className="mt-12">
            <div className="rounded-3xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow text-primary">Forecast</p>
                  <h3 className="mt-2 font-display text-xl text-foreground sm:text-2xl">
                    Predicted demand · next 7 days
                  </h3>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-primary">
                    Saturday peak — staff 2 extra stylists
                  </p>
                </div>
              </div>

              <div className="mt-10 flex h-56 items-end gap-3 sm:gap-6">
                {BARS.map((h, i) => (
                  <div key={DAYS[i]} className="flex-1 text-center">
                    <motion.div
                      className="w-full rounded-t-lg bg-gradient-to-b from-primary to-purple-600"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h * 2}px` }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{
                        duration: 0.7,
                        delay: i * 0.08,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                    <p className="mt-3 text-xs text-muted-foreground">{DAYS[i]}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border/50 pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-xs text-muted-foreground">Demand</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-purple-500" />
                    <span className="text-xs text-muted-foreground">Capacity</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  AI confidence: <span className="font-semibold text-primary">94%</span>
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative w-full overflow-hidden py-24 bg-card/20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Testimonials</span>
            </div>
            <h3 className="mt-6 text-2xl font-display sm:text-3xl lg:text-4xl">
              What Our Clients Say About{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                AI Analytics
              </span>
            </h3>
          </motion.div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {TESTIMONIALS.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, idx) => (
                    <Star
                      key={idx}
                      className={`h-4 w-4 ${
                        idx < testimonial.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/20"
                      }`}
                    />
                  ))}
                </div>
                <blockquote className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  "{testimonial.quote}"
                </blockquote>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 text-sm font-medium text-primary">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full overflow-hidden py-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 p-8 text-center border border-primary/10 sm:p-12"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Ready to Transform</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl">
                Put AI to work in{" "}
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  your salon today
                </span>
              </h3>
              <p className="max-w-lg text-muted-foreground">
                Start your 14-day free trial and experience the power of AI-driven salon management.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/register"
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
          </motion.div>
        </div>
      </section>

      <CtaBanner title="Put AI to work in your salon." />
    </>
  );
}

export default AiPage;