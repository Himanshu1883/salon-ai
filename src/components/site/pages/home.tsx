"use client";

import { CtaBanner } from "@/components/site/Cta";
import { Reveal } from "@/components/site/Reveal";
import { ParallaxBanner } from "@/components/site/Sections";
import {
  AI_CARDS,
  ALL_MODULES,
  FAQS,
  FEATURES,
  PLANS,
  SALON_TYPES,
  TESTIMONIALS,
} from "@/lib/site-data";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
import { useState } from "react";

const bannerAppointments = "/gotix/banner-appointments.jpg";
const bannerGrowth = "/gotix/banner-growth.jpg";
const bannerModern = "/gotix/banner-modern.jpg";
const heroImg = "/gotix/hero-salon.jpg";
const TITLE = "Gotix — AI-Powered Salon CRM & ERP Software";
const DESC =
  "Appointments, POS billing, inventory, CRM and AI analytics in one intelligent platform built for salons, spas and beauty chains.";

const PILLS = [
  "Appointments",
  "POS Billing",
  "Inventory",
  "CRM",
  "Marketing",
  "Membership",
  "WhatsApp",
  "Reports",
  "Analytics",
  "Multi-Branch",
];

const FLOATING = [
  { label: "Revenue", value: "₹2.4L", note: "+12% this month" },
  { label: "Inventory", value: "124", note: "Items in stock" },
  { label: "Clients", value: "1,284", note: "+18% MoM" },
];

function HomePageView() {
  const [currentSlide, setCurrentSlide] = useState(0);
  return (
    <>
      {/* A. HERO - Enhanced with Dot Navigation */}
      <section className="relative isolate min-h-screen w-full overflow-hidden pt-24 lg:pt-28">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="Premium modern salon interior with elegant styling stations and ambient lighting"
            width={1920}
            height={1088}
            className="h-full w-full object-cover ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/80 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-20 bottom-20 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        {/* Slides Container with Dot Navigation */}
        <div className="relative z-10 overflow-hidden">
          <motion.div
            className="flex"
            animate={{ x: `-${currentSlide * 100}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Slide 1 - Main Hero */}
            <div className="min-w-full">
              <div className="relative mx-auto grid w-full max-w-[1500px] items-center gap-12 px-5 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
                {/* Left Column - Content */}
                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">
                      AI-Powered Salon Management
                    </span>
                    <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      v3.0
                    </span>
                  </motion.div>

                  <motion.h1
                    className="max-w-3xl text-4xl leading-[1.05] sm:text-5xl lg:text-[4.1rem]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.08 }}
                  >
                    Transform your salon into a{" "}
                    <span className="relative">
                      <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        smart business
                      </span>
                      <motion.span
                        className="absolute -bottom-2 left-0 h-0.5 w-full bg-gradient-to-r from-primary to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                      />
                    </span>
                  </motion.h1>

                  <motion.p
                    className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.16 }}
                  >
                    The all-in-one AI platform that automates appointments,
                    optimizes inventory, boosts revenue, and delivers
                    exceptional client experiences — all from a single
                    dashboard.
                  </motion.p>

                  <motion.div
                    className="flex flex-wrap gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    {[
                      {
                        icon: <TrendingUp className="h-4 w-4" />,
                        label: "Revenue Growth",
                        value: "+156%",
                        sub: "YoY growth",
                      },
                      {
                        icon: <Users className="h-4 w-4" />,
                        label: "Active Users",
                        value: "12.5K",
                        sub: "Salons worldwide",
                      },
                      {
                        icon: <CheckCircle2 className="h-4 w-4" />,
                        label: "Efficiency",
                        value: "94%",
                        sub: "Booking accuracy",
                      },
                    ].map((stat, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                          {stat.icon}
                        </div>
                        <div>
                          <p className="font-display text-lg font-bold">
                            {stat.value}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stat.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70">
                            {stat.sub}
                          </p>
                        </div>
                      </div>
                    ))}
                  </motion.div>

                  <motion.div
                    className="flex flex-wrap gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.24 }}
                  >
                    {[
                      "AI-powered scheduling",
                      "Real-time analytics",
                      "Smart inventory mgmt",
                      "Client CRM",
                      "Automated billing",
                      "Staff performance",
                      "Marketing automation",
                      "Multi-location sync",
                    ].map((feature) => (
                      <span
                        key={feature}
                        className="group flex items-center gap-1.5 rounded-full border border-border/50 bg-card/30 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
                      >
                        <CheckCircle2 className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                        {feature}
                      </span>
                    ))}
                  </motion.div>

                  <motion.div
                    className="flex flex-wrap gap-3 pt-2"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.32 }}
                  >
                    <Link
                      href="/signup"
                      className="group btn-base btn-primary relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Start Free Trial
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                    <Link
                      href="/demo"
                      className="btn-base btn-outline border-2 bg-background/50 backdrop-blur-sm hover:border-primary"
                    >
                      <Calendar className="h-4 w-4" />
                      Book a Demo
                    </Link>
                    <Link
                      href="/features"
                      className="btn-base btn-ghost text-muted-foreground hover:text-primary"
                    >
                      Explore Features →
                    </Link>
                  </motion.div>

                  <motion.div
                    className="flex items-center gap-6 pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex -space-x-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/30 to-purple-600/30"
                        />
                      ))}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className="h-3 w-3 fill-yellow-500 text-yellow-500"
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Trusted by{" "}
                        <span className="font-semibold text-foreground">
                          1,200+
                        </span>{" "}
                        salons worldwide
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Dashboard Preview */}
                <div className="relative hidden lg:block">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="glass-card overflow-hidden p-4 shadow-2xl"
                  >
                    <div className="rounded-xl border border-border/50 bg-card/95 p-5 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Today's Overview
                          </p>
                          <p className="font-display text-2xl font-bold">
                            Command Center
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-2 w-2 animate-pulse rounded-full bg-green-500" />
                          <span className="text-xs text-muted-foreground">
                            Live
                          </span>
                          <Bell className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-4 gap-2">
                        {[
                          {
                            label: "Revenue",
                            value: "₹48,320",
                            change: "+8%",
                            icon: (
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            ),
                          },
                          {
                            label: "Appointments",
                            value: "47",
                            change: "+12%",
                            icon: (
                              <Calendar className="h-3 w-3 text-blue-500" />
                            ),
                          },
                          {
                            label: "Walk-ins",
                            value: "12",
                            change: "+5%",
                            icon: <Users className="h-3 w-3 text-purple-500" />,
                          },
                          {
                            label: "Conversion",
                            value: "86%",
                            change: "+3%",
                            icon: (
                              <Target className="h-3 w-3 text-orange-500" />
                            ),
                          },
                        ].map((stat) => (
                          <div
                            key={stat.label}
                            className="rounded-lg bg-muted/50 p-2.5 text-center transition-colors hover:bg-muted"
                          >
                            <div className="flex items-center justify-center gap-1">
                              {stat.icon}
                              <p className="font-display text-sm font-bold">
                                {stat.value}
                              </p>
                            </div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                              {stat.label}
                            </p>
                            <p className="text-[10px] text-green-500">
                              {stat.change}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 h-20 rounded-lg bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm" />

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Next Appointments</span>
                          <span className="text-primary">View all →</span>
                        </div>
                        {[
                          {
                            name: "Aditi Rao",
                            service: "Airbrush Makeup",
                            time: "10:30 AM",
                            status: "confirmed",
                          },
                          {
                            name: "Neha S",
                            service: "Hair Colour + Treatment",
                            time: "1:15 PM",
                            status: "waiting",
                          },
                          {
                            name: "Priya M",
                            service: "Bridal Package",
                            time: "3:00 PM",
                            status: "pending",
                          },
                          {
                            name: "Sneha K",
                            service: "Nail Art Premium",
                            time: "5:30 PM",
                            status: "confirmed",
                          },
                        ].map((apt, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs transition-colors hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                {apt.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{apt.name}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {apt.service}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground">
                                {apt.time}
                              </p>
                              <span
                                className={`text-[9px] font-medium ${
                                  apt.status === "confirmed"
                                    ? "text-green-500"
                                    : apt.status === "waiting"
                                      ? "text-yellow-500"
                                      : "text-blue-500"
                                }`}
                              >
                                {apt.status.charAt(0).toUpperCase() +
                                  apt.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex gap-2">
                        {[
                          {
                            icon: <Calendar className="h-3.5 w-3.5" />,
                            label: "New Booking",
                          },
                          {
                            icon: <Users className="h-3.5 w-3.5" />,
                            label: "Add Client",
                          },
                          {
                            icon: <MessageSquare className="h-3.5 w-3.5" />,
                            label: "Message",
                          },
                        ].map((action) => (
                          <button
                            key={action.label}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border/50 bg-card/50 px-2 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                          >
                            {action.icon}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {[
                    {
                      label: "AI Insights",
                      value: "92%",
                      note: "Revenue accuracy↑",
                      icon: <TrendingUp className="h-3 w-3 text-primary" />,
                      color: "from-blue-500/20 to-purple-500/20",
                    },
                    {
                      label: "Client Satisfaction",
                      value: "4.9★",
                      note: "Based on 2,847 reviews",
                      icon: <Star className="h-3 w-3 text-yellow-500" />,
                      color: "from-yellow-500/20 to-orange-500/20",
                    },
                    {
                      label: "Today's Bookings",
                      value: "47",
                      note: "+12% vs yesterday",
                      icon: <Calendar className="h-3 w-3 text-green-500" />,
                      color: "from-green-500/20 to-teal-500/20",
                    },
                    {
                      label: "Active Staff",
                      value: "8",
                      note: "2 on break",
                      icon: <Users className="h-3 w-3 text-blue-500" />,
                      color: "from-blue-500/20 to-cyan-500/20",
                    },
                  ].map((f, i) => (
                    <motion.div
                      key={f.label}
                      className={`glass-card absolute px-4 py-3 shadow-lg backdrop-blur-md ${i % 2 === 0 ? "drift-left" : "drift-right"}`}
                      style={{
                        top: `${10 + i * 22}%`,
                        left: i % 2 === 0 ? "-12%" : "auto",
                        right: i % 2 === 0 ? "auto" : "-8%",
                        animationDelay: `${i * 0.6}s`,
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                    >
                      <div
                        className={`rounded-lg bg-gradient-to-r ${f.color} p-2`}
                      >
                        <div className="flex items-center gap-2">
                          {f.icon}
                          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                            {f.label}
                          </p>
                        </div>
                        <p className="font-display text-xl font-bold">
                          {f.value}
                        </p>
                        <p className="text-[10px] text-primary">{f.note}</p>
                      </div>
                    </motion.div>
                  ))}

                  <motion.div
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass-card px-6 py-2.5 backdrop-blur-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium">
                          Enterprise Grade
                        </span>
                      </div>
                      <div className="h-4 w-px bg-border" />
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs font-medium">
                          99.9% Uptime
                        </span>
                      </div>
                      <div className="h-4 w-px bg-border" />
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-medium">
                          #1 Salon Software
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Slide 2 - Analytics Focus */}
            <div className="min-w-full">
              <div className="relative mx-auto grid w-full max-w-[1500px] items-center gap-12 px-5 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">
                      AI-Powered Analytics
                    </span>
                    <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      v3.0
                    </span>
                  </motion.div>

                  <motion.h1
                    className="max-w-3xl text-4xl leading-[1.05] sm:text-5xl lg:text-[4.1rem]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.08 }}
                  >
                    Unlock{" "}
                    <span className="relative">
                      <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Data-Driven Growth
                      </span>
                      <motion.span
                        className="absolute -bottom-2 left-0 h-0.5 w-full bg-gradient-to-r from-primary to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                      />
                    </span>
                  </motion.h1>

                  <motion.p
                    className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.16 }}
                  >
                    Make smarter decisions with real-time analytics, client
                    insights, and AI-powered forecasting that helps you stay
                    ahead of the competition.
                  </motion.p>

                  <motion.div
                    className="flex flex-wrap gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    {[
                      {
                        icon: <TrendingUp className="h-4 w-4" />,
                        label: "Revenue Impact",
                        value: "+32%",
                        sub: "Average growth",
                      },
                      {
                        icon: <Users className="h-4 w-4" />,
                        label: "Client Retention",
                        value: "94%",
                        sub: "Year over year",
                      },
                      {
                        icon: <CheckCircle2 className="h-4 w-4" />,
                        label: "Forecast Accuracy",
                        value: "97%",
                        sub: "AI-powered",
                      },
                    ].map((stat, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                          {stat.icon}
                        </div>
                        <div>
                          <p className="font-display text-lg font-bold">
                            {stat.value}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stat.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70">
                            {stat.sub}
                          </p>
                        </div>
                      </div>
                    ))}
                  </motion.div>

                  <motion.div
                    className="flex flex-wrap gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.24 }}
                  >
                    {[
                      "Predictive analytics",
                      "Client segmentation",
                      "Revenue forecasting",
                      "Staff optimization",
                      "Service performance",
                      "Peak hour insights",
                    ].map((feature) => (
                      <span
                        key={feature}
                        className="group flex items-center gap-1.5 rounded-full border border-border/50 bg-card/30 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
                      >
                        <CheckCircle2 className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                        {feature}
                      </span>
                    ))}
                  </motion.div>

                  <motion.div
                    className="flex flex-wrap gap-3 pt-2"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.32 }}
                  >
                    <Link
                      href="/signup"
                      className="group btn-base btn-primary relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Start Free Trial{" "}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                    <Link
                      href="/demo"
                      className="btn-base btn-outline border-2 bg-background/50 backdrop-blur-sm hover:border-primary"
                    >
                      <Calendar className="h-4 w-4" /> Book a Demo
                    </Link>
                  </motion.div>
                </div>

                {/* Right Column - Analytics Dashboard */}
                <div className="relative hidden lg:block">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="glass-card overflow-hidden p-4 shadow-2xl"
                  >
                    <div className="rounded-xl border border-border/50 bg-card/95 p-5 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Analytics Dashboard
                          </p>
                          <p className="font-display text-2xl font-bold">
                            Growth Insights
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-2 w-2 animate-pulse rounded-full bg-green-500" />
                          <span className="text-xs text-muted-foreground">
                            Live
                          </span>
                          <Bell className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="mt-5 grid grid-cols-4 gap-2">
                        {[
                          {
                            label: "Revenue",
                            value: "₹2.4L",
                            change: "+12%",
                            icon: (
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            ),
                          },
                          {
                            label: "Growth",
                            value: "32%",
                            change: "+8%",
                            icon: (
                              <TrendingUp className="h-3 w-3 text-blue-500" />
                            ),
                          },
                          {
                            label: "Retention",
                            value: "94%",
                            change: "+5%",
                            icon: <Users className="h-3 w-3 text-purple-500" />,
                          },
                          {
                            label: "Forecast",
                            value: "97%",
                            change: "+3%",
                            icon: (
                              <Target className="h-3 w-3 text-orange-500" />
                            ),
                          },
                        ].map((stat) => (
                          <div
                            key={stat.label}
                            className="rounded-lg bg-muted/50 p-2.5 text-center transition-colors hover:bg-muted"
                          >
                            <div className="flex items-center justify-center gap-1">
                              {stat.icon}
                              <p className="font-display text-sm font-bold">
                                {stat.value}
                              </p>
                            </div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                              {stat.label}
                            </p>
                            <p className="text-[10px] text-green-500">
                              {stat.change}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 h-20 rounded-lg bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm" />
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Top Services</span>
                          <span className="text-primary">View all →</span>
                        </div>
                        {[
                          {
                            name: "Hair Colour",
                            revenue: "₹12,450",
                            growth: "+15%",
                          },
                          {
                            name: "Airbrush Makeup",
                            revenue: "₹8,320",
                            growth: "+22%",
                          },
                          {
                            name: "Bridal Package",
                            revenue: "₹15,800",
                            growth: "+18%",
                          },
                          {
                            name: "Nail Art",
                            revenue: "₹4,200",
                            growth: "+9%",
                          },
                        ].map((service, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs transition-colors hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                                {service.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{service.name}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {service.revenue}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-green-500">
                                {service.growth}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2">
                        {[
                          {
                            icon: <TrendingUp className="h-3.5 w-3.5" />,
                            label: "Analytics",
                          },
                          {
                            icon: <Users className="h-3.5 w-3.5" />,
                            label: "Reports",
                          },
                          {
                            icon: <MessageSquare className="h-3.5 w-3.5" />,
                            label: "Insights",
                          },
                        ].map((action) => (
                          <button
                            key={action.label}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border/50 bg-card/50 px-2 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                          >
                            {action.icon}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {[
                    {
                      label: "Revenue Impact",
                      value: "+32%",
                      note: "Average growth",
                      icon: <TrendingUp className="h-3 w-3 text-primary" />,
                      color: "from-blue-500/20 to-purple-500/20",
                    },
                    {
                      label: "Client Retention",
                      value: "94%",
                      note: "Year over year",
                      icon: <Users className="h-3 w-3 text-yellow-500" />,
                      color: "from-yellow-500/20 to-orange-500/20",
                    },
                    {
                      label: "Forecast Acc",
                      value: "97%",
                      note: "AI-powered",
                      icon: <Target className="h-3 w-3 text-green-500" />,
                      color: "from-green-500/20 to-teal-500/20",
                    },
                    {
                      label: "Service Growth",
                      value: "22%",
                      note: "Top performer",
                      icon: <TrendingUp className="h-3 w-3 text-blue-500" />,
                      color: "from-blue-500/20 to-cyan-500/20",
                    },
                  ].map((f, i) => (
                    <motion.div
                      key={f.label}
                      className={`glass-card absolute px-4 py-3 shadow-lg backdrop-blur-md ${i % 2 === 0 ? "drift-left" : "drift-right"}`}
                      style={{
                        top: `${10 + i * 22}%`,
                        left: i % 2 === 0 ? "-12%" : "auto",
                        right: i % 2 === 0 ? "auto" : "-8%",
                        animationDelay: `${i * 0.6}s`,
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                    >
                      <div
                        className={`rounded-lg bg-gradient-to-r ${f.color} p-2`}
                      >
                        <div className="flex items-center gap-2">
                          {f.icon}
                          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                            {f.label}
                          </p>
                        </div>
                        <p className="font-display text-xl font-bold">
                          {f.value}
                        </p>
                        <p className="text-[10px] text-primary">{f.note}</p>
                      </div>
                    </motion.div>
                  ))}

                  <motion.div
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass-card px-6 py-2.5 backdrop-blur-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium">
                          Enterprise Grade
                        </span>
                      </div>
                      <div className="h-4 w-px bg-border" />
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs font-medium">
                          99.9% Uptime
                        </span>
                      </div>
                      <div className="h-4 w-px bg-border" />
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-medium">
                          #1 Salon Software
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Slide 3 - Client Experience Focus */}
            <div className="min-w-full">
              <div className="relative mx-auto grid w-full max-w-[1500px] items-center gap-12 px-5 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">
                      Client Experience
                    </span>
                    <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      v3.0
                    </span>
                  </motion.div>

                  <motion.h1
                    className="max-w-3xl text-4xl leading-[1.05] sm:text-5xl lg:text-[4.1rem]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.08 }}
                  >
                    Deliver{" "}
                    <span className="relative">
                      <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Exceptional Experiences
                      </span>
                      <motion.span
                        className="absolute -bottom-2 left-0 h-0.5 w-full bg-gradient-to-r from-primary to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                      />
                    </span>
                  </motion.h1>

                  <motion.p
                    className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.16 }}
                  >
                    Personalize every client interaction with 360° profiles,
                    preferences tracking, and automated engagement that builds
                    lasting loyalty.
                  </motion.p>

                  <motion.div
                    className="flex flex-wrap gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    {[
                      {
                        icon: <Users className="h-4 w-4" />,
                        label: "Client Lifetime",
                        value: "4.2x",
                        sub: "Higher retention",
                      },
                      {
                        icon: <CheckCircle2 className="h-4 w-4" />,
                        label: "Satisfaction",
                        value: "98%",
                        sub: "Positive reviews",
                      },
                      {
                        icon: <TrendingUp className="h-4 w-4" />,
                        label: "Referrals",
                        value: "64%",
                        sub: "Word of mouth",
                      },
                    ].map((stat, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                          {stat.icon}
                        </div>
                        <div>
                          <p className="font-display text-lg font-bold">
                            {stat.value}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stat.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70">
                            {stat.sub}
                          </p>
                        </div>
                      </div>
                    ))}
                  </motion.div>

                  <motion.div
                    className="flex flex-wrap gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.24 }}
                  >
                    {[
                      "Client 360° profiles",
                      "Preference tracking",
                      "Automated engagement",
                      "Loyalty programs",
                      "Birthday rewards",
                      "Feedback management",
                    ].map((feature) => (
                      <span
                        key={feature}
                        className="group flex items-center gap-1.5 rounded-full border border-border/50 bg-card/30 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
                      >
                        <CheckCircle2 className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                        {feature}
                      </span>
                    ))}
                  </motion.div>

                  <motion.div
                    className="flex flex-wrap gap-3 pt-2"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.32 }}
                  >
                    <Link
                      href="/signup"
                      className="group btn-base btn-primary relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Start Free Trial{" "}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                    <Link
                      href="/demo"
                      className="btn-base btn-outline border-2 bg-background/50 backdrop-blur-sm hover:border-primary"
                    >
                      <Calendar className="h-4 w-4" /> Book a Demo
                    </Link>
                  </motion.div>
                </div>

                {/* Right Column - Client Dashboard */}
                <div className="relative hidden lg:block">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="glass-card overflow-hidden p-4 shadow-2xl"
                  >
                    <div className="rounded-xl border border-border/50 bg-card/95 p-5 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Client Dashboard
                          </p>
                          <p className="font-display text-2xl font-bold">
                            Client 360°
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-2 w-2 animate-pulse rounded-full bg-green-500" />
                          <span className="text-xs text-muted-foreground">
                            Live
                          </span>
                          <Bell className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="mt-5 grid grid-cols-4 gap-2">
                        {[
                          {
                            label: "Total Clients",
                            value: "1,284",
                            change: "+12%",
                            icon: <Users className="h-3 w-3 text-green-500" />,
                          },
                          {
                            label: "New Today",
                            value: "12",
                            change: "+8%",
                            icon: <Users className="h-3 w-3 text-blue-500" />,
                          },
                          {
                            label: "Satisfaction",
                            value: "98%",
                            change: "+5%",
                            icon: <Star className="h-3 w-3 text-yellow-500" />,
                          },
                          {
                            label: "Referrals",
                            value: "64%",
                            change: "+3%",
                            icon: (
                              <TrendingUp className="h-3 w-3 text-purple-500" />
                            ),
                          },
                        ].map((stat) => (
                          <div
                            key={stat.label}
                            className="rounded-lg bg-muted/50 p-2.5 text-center transition-colors hover:bg-muted"
                          >
                            <div className="flex items-center justify-center gap-1">
                              {stat.icon}
                              <p className="font-display text-sm font-bold">
                                {stat.value}
                              </p>
                            </div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                              {stat.label}
                            </p>
                            <p className="text-[10px] text-green-500">
                              {stat.change}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 h-20 rounded-lg bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm" />
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Recent Clients</span>
                          <span className="text-primary">View all →</span>
                        </div>
                        {[
                          {
                            name: "Aditi Rao",
                            visits: "12 visits",
                            last: "2 days ago",
                            status: "VIP",
                          },
                          {
                            name: "Neha S",
                            visits: "8 visits",
                            last: "5 days ago",
                            status: "Regular",
                          },
                          {
                            name: "Priya M",
                            visits: "15 visits",
                            last: "1 day ago",
                            status: "VIP",
                          },
                          {
                            name: "Sneha K",
                            visits: "6 visits",
                            last: "3 days ago",
                            status: "New",
                          },
                        ].map((client, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs transition-colors hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                                {client.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{client.name}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {client.visits}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground">
                                {client.last}
                              </p>
                              <span
                                className={`text-[9px] font-medium ${client.status === "VIP" ? "text-purple-500" : client.status === "Regular" ? "text-blue-500" : "text-green-500"}`}
                              >
                                ● {client.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2">
                        {[
                          {
                            icon: <Users className="h-3.5 w-3.5" />,
                            label: "Add Client",
                          },
                          {
                            icon: <MessageSquare className="h-3.5 w-3.5" />,
                            label: "Message",
                          },
                          {
                            icon: <Star className="h-3.5 w-3.5" />,
                            label: "Rewards",
                          },
                        ].map((action) => (
                          <button
                            key={action.label}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border/50 bg-card/50 px-2 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                          >
                            {action.icon}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {[
                    {
                      label: "Client Lifetime",
                      value: "4.2x",
                      note: "Higher retention",
                      icon: <Users className="h-3 w-3 text-primary" />,
                      color: "from-blue-500/20 to-purple-500/20",
                    },
                    {
                      label: "Satisfaction",
                      value: "98%",
                      note: "Positive reviews",
                      icon: <Star className="h-3 w-3 text-yellow-500" />,
                      color: "from-yellow-500/20 to-orange-500/20",
                    },
                    {
                      label: "Referrals",
                      value: "64%",
                      note: "Word of mouth",
                      icon: <TrendingUp className="h-3 w-3 text-green-500" />,
                      color: "from-green-500/20 to-teal-500/20",
                    },
                    {
                      label: "VIP Clients",
                      value: "128",
                      note: "Top spenders",
                      icon: <Award className="h-3 w-3 text-purple-500" />,
                      color: "from-purple-500/20 to-pink-500/20",
                    },
                  ].map((f, i) => (
                    <motion.div
                      key={f.label}
                      className={`glass-card absolute px-4 py-3 shadow-lg backdrop-blur-md ${i % 2 === 0 ? "drift-left" : "drift-right"}`}
                      style={{
                        top: `${10 + i * 22}%`,
                        left: i % 2 === 0 ? "-12%" : "auto",
                        right: i % 2 === 0 ? "auto" : "-8%",
                        animationDelay: `${i * 0.6}s`,
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                    >
                      <div
                        className={`rounded-lg bg-gradient-to-r ${f.color} p-2`}
                      >
                        <div className="flex items-center gap-2">
                          {f.icon}
                          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                            {f.label}
                          </p>
                        </div>
                        <p className="font-display text-xl font-bold">
                          {f.value}
                        </p>
                        <p className="text-[10px] text-primary">{f.note}</p>
                      </div>
                    </motion.div>
                  ))}

                  <motion.div
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass-card px-6 py-2.5 backdrop-blur-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium">
                          Enterprise Grade
                        </span>
                      </div>
                      <div className="h-4 w-px bg-border" />
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs font-medium">
                          99.9% Uptime
                        </span>
                      </div>
                      <div className="h-4 w-px bg-border" />
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-medium">
                          #1 Salon Software
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Slide Navigation Arrows - Enhanced Visibility */}
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-between pointer-events-none lg:left-8 lg:right-8">
            <button
              onClick={() =>
                setCurrentSlide((prev) => (prev === 0 ? 2 : prev - 1))
              }
              className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-primary shadow-lg transition-all hover:bg-white hover:scale-110 hover:shadow-xl focus:outline-none"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
            </button>
            <button
              onClick={() =>
                setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1))
              }
              className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-primary shadow-lg transition-all hover:bg-white hover:scale-110 hover:shadow-xl focus:outline-none"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
            </button>
          </div>

          {/* Slide Navigation Dots */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-3">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className="cursor-pointer transition-all focus:outline-none"
                aria-label={`Go to slide ${index + 1}`}
              >
                <motion.div
                  className="h-2 rounded-full bg-white/30"
                  animate={{
                    width: currentSlide === index ? 32 : 8,
                    backgroundColor:
                      currentSlide === index
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(255,255,255,0.3)",
                  }}
                  transition={{ duration: 0.3 }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1 }}
        >
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Scroll to explore
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground animate-bounce" />
        </motion.div>
      </section>

      {/* B. TRUST BRIDGE - Place it HERE, outside any other section */}
      <div className="w-full border-y border-border/60 bg-background/50 backdrop-blur-sm py-6">
        <div className="mx-auto flex w-full max-w-[1500px] items-center overflow-hidden px-5 sm:px-8">
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
      </div>

      {/* C. MODULES PREVIEW - Redesigned with limited modules */}
      <section className="relative w-full overflow-hidden py-24 lg:py-32">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-blue-500/5 blur-3xl" />
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
            {[
              {
                title: "AI-Powered Scheduling",
                description:
                  "Optimize appointments with machine learning that predicts peak times and reduces no-shows",
                icon: Sparkles,
                badge: "New",
                gradient: "from-violet-500 to-purple-600",
              },
              {
                title: "Smart Inventory",
                description:
                  "Automated stock management with predictive reordering and supplier integration",
                icon: Package,
                badge: "Popular",
                gradient: "from-emerald-500 to-teal-600",
              },
              {
                title: "Client Intelligence",
                description:
                  "Deep client insights with purchase patterns, preferences, and automated engagement",
                icon: TrendingUp,
                badge: "AI-Powered",
                gradient: "from-blue-500 to-indigo-600",
              },
            ].map((module, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6 transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20"
              >
                {/* Glow effect */}
                <div
                  className={`absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br ${module.gradient} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20`}
                />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div
                      className={`rounded-xl bg-gradient-to-br ${module.gradient} p-3`}
                    >
                      <module.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
                      {module.badge}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-medium">
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
              {ALL_MODULES.slice(0, 8).map((module, index) => (
                <motion.div
                  key={module.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04 }}
                  className="group relative"
                >
                  <div className="surface-card lift h-full cursor-pointer p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                    <div className="flex items-start justify-between">
                      <div className="rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 p-2.5">
                        <div className="h-5 w-5 rounded bg-gradient-to-br from-primary to-purple-500" />
                      </div>
                      <span className="text-[10px] font-medium text-primary/60">
                        {module.group}
                      </span>
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

                    {/* Hover indicator */}
                    <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </motion.div>
              ))}
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
            className="mt-16 rounded-2xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 p-8 text-center border border-primary/10"
          >
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
      <section className="w-full bg-gradient-to-b from-background to-card/50 py-24 lg:py-32">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
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
                  { label: "Business Types", value: "10+", icon: Layers },
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
            {SALON_TYPES.map((type, index) => (
              <motion.div
                key={type.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <Link href="/solutions" className="block h-full">
                  <div className="surface-card lift h-full overflow-hidden p-5 text-center transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                    {/* Icon/Emoji placeholder - you can replace with actual icons */}
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 text-2xl transition-all duration-300 group-hover:scale-110 group-hover:from-primary/20 group-hover:to-purple-500/20">
                      {type.name.includes("Hair") && "💇"}
                      {type.name.includes("Beauty") && "💄"}
                      {type.name.includes("Spa") && "🧖"}
                      {type.name.includes("Skin") && "✨"}
                      {type.name.includes("Barber") && "✂️"}
                      {type.name.includes("Nail") && "💅"}
                      {type.name.includes("Makeup") && "🎨"}
                      {type.name.includes("Academy") && "📚"}
                      {type.name.includes("Bridal") && "👰"}
                      {type.name.includes("Tattoo") && "🎯"}
                    </div>

                    <h3 className="font-display text-base font-medium transition-colors group-hover:text-primary">
                      {type.name}
                    </h3>

                    <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                      Solution
                    </p>

                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground/80 line-clamp-3">
                      {type.desc}
                    </p>

                    {/* Learn more indicator */}
                    <div className="mt-3 flex items-center justify-center gap-1 text-[10px] font-medium text-primary opacity-0 transition-all group-hover:opacity-100">
                      Learn more
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
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
            className="mt-16 rounded-2xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 p-8 text-center border border-primary/10"
          >
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
                  className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-6 py-3 font-medium backdrop-blur-sm transition-all hover:border-primary hover:bg-primary/5"
                >
                  <MessageSquare className="h-4 w-4" />
                  Talk to an Expert
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">
                Free consultation • Personalized demo • 14-day trial
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* F. FEATURES TEASER - Redesigned */}
      <section className="relative w-full overflow-hidden py-24 lg:py-32">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-3xl" />
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
            className="mt-16 rounded-2xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 p-8 text-center border border-primary/10"
          >
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

      {/* G. AI TEASER - Redesigned */}
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

              {/* AI Stats */}
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

          {/* AI Cards Grid - Enhanced */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {AI_CARDS.map((card, index) => (
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
                      <div className="h-6 w-6 rounded-lg gradient-brand" />
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
            ))}
          </div>

          {/* AI Feature Highlights */}
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
                  Book a Demo
                </Link>
              </div>
              <p className="text-xs text-ink-foreground/50">
                No credit card required • Free 14-day trial • 24/7 support
              </p>
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
      <section className="relative w-full overflow-hidden py-24 lg:py-32">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
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
            className="mt-16 rounded-2xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 p-8 text-center border border-primary/10"
          >
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
                  className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-6 py-3 font-medium backdrop-blur-sm transition-all hover:border-primary hover:bg-primary/5"
                >
                  Read More Stories
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">
                Join the community of successful salon owners
              </p>
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
      <section className="relative w-full overflow-hidden py-24 lg:py-32 bg-card">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-3xl" />
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
          <div className="mt-12 grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
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
                  className={`relative h-full overflow-hidden rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-2 ${
                    plan.popular
                      ? "border-primary bg-gradient-to-b from-primary/5 to-transparent shadow-xl shadow-primary/10"
                      : "border-border/50 bg-card/50 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                  }`}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute right-4 top-4">
                      <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-medium text-primary-foreground">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan name */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2.5 ${plan.popular ? "bg-primary/10" : "bg-muted/50"}`}
                    >
                      {plan.name === "Starter" && (
                        <Zap className="h-5 w-5 text-primary" />
                      )}
                      {plan.name === "Professional" && (
                        <TrendingUp className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-display text-xl font-medium">
                        {plan.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {plan.name === "Starter"
                          ? "For growing salons"
                          : "For established businesses"}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mt-6">
                    <p className="font-display text-5xl font-bold">
                      ₹
                      {(plan.name === "Starter" ? 599 : 1499).toLocaleString(
                        "en-IN",
                      )}
                      <span className="ml-1 text-base font-normal text-muted-foreground">
                        /mo
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Billed monthly • Cancel anytime
                    </p>
                  </div>

                  {/* Description */}
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {plan.desc}
                  </p>

                  {/* Features list */}
                  <div className="mt-6 space-y-2.5">
                    {plan.includes.slice(0, 5).map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </div>
                    ))}
                    {plan.includes.length > 5 && (
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          +{plan.includes.length - 5} more features
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="mt-8">
                    <Link
                      href={plan.to}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all ${
                        plan.popular
                          ? "bg-primary text-primary-foreground hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25"
                          : "border border-border/50 bg-background/50 text-foreground hover:border-primary hover:bg-primary/5"
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4" />
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
            className="mt-16 rounded-2xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 p-8 text-center border border-primary/10"
          >
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-medium text-muted-foreground">
                Have questions about pricing?
              </p>
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
      <section className="relative w-full overflow-hidden py-24 lg:py-32">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
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

          {/* FAQ Accordion - Enhanced */}
          <div className="mt-12 space-y-3">
            {FAQS.slice(0, 4).map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group rounded-2xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              >
                <details className="group/details">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 list-none">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
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
                    <div className="rounded-lg bg-muted/30 p-4">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {faq.a}
                      </p>
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
            className="mt-16 rounded-2xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 p-8 text-center border border-primary/10"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Still have questions?
                </span>
              </div>
              <p className="max-w-md text-sm text-muted-foreground">
                Our team is here to help. Get in touch and we'll get back to you
                within 2 hours.
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
                  className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-6 py-3 font-medium backdrop-blur-sm transition-all hover:border-primary hover:bg-primary/5"
                >
                  <Calendar className="h-4 w-4" />
                  Book a Demo
                </Link>
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
