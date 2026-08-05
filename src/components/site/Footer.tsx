"use client";

import { STATS } from "@/lib/site-data";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  AtSign,
  Award,
  Clock,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Counter } from "./Counter";
import { Brand } from "./Navbar";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Modules", href: "/modules" },
      { label: "AI Analytics", href: "/ai" },
      { label: "Integrations", href: "/platform" },
      { label: "API", href: "/platform" },
      { label: "Changelog", href: "/platform" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/about" },
      { label: "Blog", href: "/about" },
      { label: "Press", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Partners", href: "/about" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/platform" },
      { label: "Help Center", href: "/faq" },
      { label: "Community", href: "/testimonials" },
      { label: "Roadmap", href: "/platform" },
      { label: "Webinars", href: "/platform" },
      { label: "Guides", href: "/platform" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Security", href: "/security" },
      { label: "GDPR", href: "/privacy" },
      { label: "Cookie Policy", href: "/privacy" },
      { label: "Data Processing", href: "/privacy" },
    ],
  },
] as const;

const SOCIALS = [
  { Icon: Share2, label: "LinkedIn", color: "hover:text-blue-600" },
  { Icon: AtSign, label: "Instagram", color: "hover:text-pink-600" },
  { Icon: MessageCircle, label: "Twitter", color: "hover:text-blue-500" },
  { Icon: Globe, label: "Facebook", color: "hover:text-blue-700" },
];

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-gradient-to-b from-[#f0edf5] via-[#f5f2f9] to-[#faf8fc]">
      {/* Large Gotix Watermark Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[15rem] font-display font-bold text-[#d5cce6]/20 tracking-[-0.05em] leading-none lg:text-[25rem] xl:text-[30rem]">
          Gotix
        </span>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-purple-200/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-blue-200/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-pink-200/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full px-6 py-8 lg:px-12">
        {/* Top Section - Brand + Stats */}
        <div className="flex flex-col gap-12 border-b border-[#d5cce6]/40 pb-12 lg:flex-row lg:items-center lg:justify-between">
          {/* Brand Column */}
          <div className="flex-1">
            <Brand light={false} />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#6b5e7a]">
              The AI-powered salon ERP trusted by boutique studios and multi-branch chains across
              India.
            </p>

            {/* Contact Info */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-xs text-[#6b5e7a]">
                <Mail className="h-3.5 w-3.5 text-[#7c6b8a]" />
                <span>support@gotix.ai</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6b5e7a]">
                <Phone className="h-3.5 w-3.5 text-[#7c6b8a]" />
                <span>+91 1800-123-456</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6b5e7a]">
                <MapPin className="h-3.5 w-3.5 text-[#7c6b8a]" />
                <span>Mumbai, India</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6b5e7a]">
                <Clock className="h-3.5 w-3.5 text-[#7c6b8a]" />
                <span>24/7 Support</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex gap-3">
              {SOCIALS.map(({ Icon, label, color }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 text-[#6b5e7a] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-md hover:text-primary ${color}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:min-w-[500px]">
            {STATS.map((s, index) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group rounded-2xl bg-white/60 p-5 text-center backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg hover:shadow-purple-100/50"
              >
                <div className="font-display text-2xl font-bold text-[#2d1f3d] sm:text-3xl">
                  <Counter value={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} />
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#6b5e7a]">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-6">
          {/* Trust Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-[#2d1f3d]">
              Why Gotix
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-sm text-[#6b5e7a]">
                <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>Enterprise-grade security with ISO 27001 certification</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#6b5e7a]">
                <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                <span>99.9% uptime guaranteed with 24/7 monitoring</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#6b5e7a]">
                <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                <span>Trusted by 1,200+ salons across 50+ cities</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#6b5e7a]">
                <Award className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                <span>Winner of "Best Salon Software 2024" award</span>
              </li>
            </ul>
          </motion.div>

          {/* Links Columns */}
          {COLUMNS.map((col, index) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-[#2d1f3d]">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="group inline-flex items-center gap-1 text-sm text-[#6b5e7a] transition-all hover:text-primary"
                    >
                      {l.label}
                      <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter / CTA Bar */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#e8e0f0] to-[#f0edf5] p-6 border border-[#d5cce6]/40">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h4 className="font-display text-sm font-semibold text-[#2d1f3d]">
                Stay in the loop
              </h4>
              <p className="text-xs text-[#6b5e7a]">
                Get product updates, tips, and exclusive offers.
              </p>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-full border border-[#d5cce6]/60 bg-white/60 px-4 py-2 text-sm text-[#2d1f3d] placeholder:text-[#6b5e7a] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:min-w-[240px]"
              />
              <button className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-white transition-all hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col gap-4 border-t border-[#d5cce6]/40 pt-6 text-xs text-[#6b5e7a] sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-wrap items-center gap-4">
            <p>© {new Date().getFullYear()} Gotix. All rights reserved.</p>
            <span className="hidden h-3 w-px bg-[#d5cce6]/60 sm:block" />
            <p className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              Made with ❤️ for beauty businesses
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/privacy" className="transition-colors hover:text-[#2d1f3d]">
              Privacy
            </Link>
            <span className="h-3 w-px bg-[#d5cce6]/60" />
            <Link href="/terms" className="transition-colors hover:text-[#2d1f3d]">
              Terms
            </Link>
            <span className="h-3 w-px bg-[#d5cce6]/60" />
            <Link href="/security" className="transition-colors hover:text-[#2d1f3d]">
              Security
            </Link>
            <span className="h-3 w-px bg-[#d5cce6]/60" />
            <Link href="/sitemap" className="transition-colors hover:text-[#2d1f3d]">
              Sitemap
            </Link>
          </div>
        </motion.div>

        {/* Language / Region Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-4 flex items-center justify-end gap-2 text-xs text-[#6b5e7a]"
        >
          <Globe className="h-3 w-3" />
          <span>India</span>
          <span className="text-[#d5cce6]/60">|</span>
          <span>English</span>
        </motion.div>
      </div>
    </footer>
  );
}
