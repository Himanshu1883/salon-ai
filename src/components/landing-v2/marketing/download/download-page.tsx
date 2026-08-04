"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Monitor,
  Share,
  Smartphone,
  Tablet,
} from "lucide-react";
import {
  LANDING_CONTAINER,
  LandingCard,
  primaryGradientButtonClass,
  sectionEyebrowTextClass,
  sectionHeadingClass,
} from "../../ui/landing-primitives";
import { InstallAppButton } from "./install-app-button";
import { cn } from "@/lib/utils";

const IOS_STEPS = [
  "Open gotix.io in Safari (Chrome won’t install apps on iPhone).",
  "Tap the Share button at the bottom of the screen.",
  "Scroll and tap Add to Home Screen.",
  "Tap Add — Go Tix appears on your home screen like a native app.",
];

const ANDROID_STEPS = [
  "Open gotix.io in Chrome.",
  "Tap Install App on this page, or use the browser menu → Install app.",
  "Confirm Install — Go Tix opens full-screen from your app drawer.",
];

const FEATURES = [
  "Record sales & create invoices",
  "Manage appointments on the go",
  "Search clients by name or phone",
  "Face ID login (native app — coming soon)",
  "Works offline after first load (cached pages)",
];

export function DownloadPageContent() {
  const iosStoreUrl = process.env.NEXT_PUBLIC_IOS_APP_STORE_URL;
  const androidStoreUrl = process.env.NEXT_PUBLIC_ANDROID_PLAY_STORE_URL;

  return (
    <>
      <section className="border-b border-[#E4DDD1] bg-gradient-to-b from-[#F5F3FF] to-[#F7F3EC] pt-[calc(var(--landing-nav-h)+2.5rem)] pb-14 md:pt-[calc(var(--landing-nav-h)+3.5rem)] md:pb-20">
        <div className={cn(LANDING_CONTAINER, "max-w-4xl text-center")}>
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 shrink-0 bg-[#1B1714]/20" aria-hidden />
            <span className={sectionEyebrowTextClass}>Mobile & desktop</span>
            <span className="h-px w-8 shrink-0 bg-[#1B1714]/20" aria-hidden />
          </div>
          <h1 className={cn(sectionHeadingClass, "text-[#7C3AED]")}>
            Download Go Tix
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#1B1714]/65 md:text-lg">
            Install Go Tix on your phone in seconds — no App Store required.
            Use billing, appointments, and clients from anywhere.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <InstallAppButton />
            <Link
              href="/login"
              className={primaryGradientButtonClass("min-h-12 px-6 py-3 text-sm")}
            >
              Open in browser
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <p className="mt-4 text-sm text-[#1B1714]/50">
            Direct link:{" "}
            <a
              href="https://www.gotix.io/download"
              className="font-medium text-[#7C3AED] underline-offset-2 hover:underline"
            >
              gotix.io/download
            </a>
          </p>
        </div>
      </section>

      <section className="bg-[#EFE8DC] py-14 md:py-20">
        <div className={cn(LANDING_CONTAINER, "max-w-5xl space-y-10")}>
          <div className="grid gap-5 md:grid-cols-3">
            <LandingCard className="p-6 md:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7C3AED]/10 text-[#7C3AED]">
                <Smartphone className="h-5 w-5" aria-hidden />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-[#1B1714]">iPhone & iPad</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#1B1714]/60">
                Add Go Tix to your home screen — works like a native app with
                full-screen login and dashboard.
              </p>
              {iosStoreUrl ? (
                <a
                  href={iosStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#1B1714] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Download on App Store
                </a>
              ) : (
                <p className="mt-5 rounded-lg bg-[#7C3AED]/8 px-3 py-2 text-xs font-medium text-[#7C3AED]">
                  Native iOS app — coming soon. Use Add to Home Screen below.
                </p>
              )}
            </LandingCard>

            <LandingCard className="p-6 md:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7C3AED]/10 text-[#7C3AED]">
                <Tablet className="h-5 w-5" aria-hidden />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-[#1B1714]">Android</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#1B1714]/60">
                Install directly from Chrome with one tap, or add to your home
                screen for quick salon access.
              </p>
              {androidStoreUrl ? (
                <a
                  href={androidStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#1B1714] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Get it on Google Play
                </a>
              ) : (
                <div className="mt-5">
                  <InstallAppButton className="w-full" />
                </div>
              )}
            </LandingCard>

            <LandingCard className="p-6 md:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7C3AED]/10 text-[#7C3AED]">
                <Monitor className="h-5 w-5" aria-hidden />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-[#1B1714]">Desktop</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#1B1714]/60">
                Use Go Tix in any browser on Mac or Windows — full ERP with
                sidebar, reports, and inventory.
              </p>
              <Link
                href="/login"
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#1B1714]/15 bg-white px-4 py-3 text-sm font-semibold text-[#1B1714] transition-colors hover:border-[#7C3AED]/30 hover:text-[#7C3AED]"
              >
                Open web app
              </Link>
            </LandingCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div id="ios-install" className="scroll-mt-28">
            <LandingCard className="p-6 md:p-8">
              <div className="flex items-center gap-3">
                <Share className="h-5 w-5 text-[#7C3AED]" aria-hidden />
                <h2 className="text-lg font-semibold text-[#1B1714]">
                  Install on iPhone (Safari)
                </h2>
              </div>
              <ol className="mt-5 space-y-3">
                {IOS_STEPS.map((step, i) => (
                  <li key={step} className="flex gap-3 text-sm text-[#1B1714]/70">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7C3AED]/10 text-xs font-bold text-[#7C3AED]">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </LandingCard>
            </div>

            <LandingCard className="p-6 md:p-8">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-[#7C3AED]" aria-hidden />
                <h2 className="text-lg font-semibold text-[#1B1714]">
                  Install on Android (Chrome)
                </h2>
              </div>
              <ol className="mt-5 space-y-3">
                {ANDROID_STEPS.map((step, i) => (
                  <li key={step} className="flex gap-3 text-sm text-[#1B1714]/70">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7C3AED]/10 text-xs font-bold text-[#7C3AED]">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </LandingCard>
          </div>

          <LandingCard className="p-6 md:p-8">
            <h2 className="text-lg font-semibold text-[#1B1714]">
              What you get on mobile
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-[#1B1714]/70"
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]"
                    aria-hidden
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </LandingCard>
        </div>
      </section>
    </>
  );
}
