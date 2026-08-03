"use client";

import { LandingSection } from "../ui/landing-primitives";
import { ProcessSection } from "./preview-photo";
import { PreviewShowcase } from "./preview-showcase";

export function PreviewSection() {
  return (
    <LandingSection
      id="preview"
      band="band"
      className="landing-preview-band !relative !overflow-hidden !py-14 md:!py-20 lg:!py-24"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-[#C4B5FD]/35 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-[#A78BFA]/25 blur-3xl" />
      </div>

      <div className="relative z-10 mb-8 text-center md:mb-10">
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="h-px w-8 shrink-0 bg-[#5B21B6]/25" aria-hidden />
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#5B21B6]">
            Platform Preview
          </span>
          <span className="hidden h-px w-8 shrink-0 bg-[#5B21B6]/25 sm:block" aria-hidden />
        </div>
        <h2 className="landing-display text-3xl font-semibold leading-tight tracking-tight text-[#1B1714] md:text-4xl lg:text-5xl">
          See It In Action
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#1B1714]/65 md:text-lg">
          Explore every corner of your salon command center.
        </p>
      </div>

      <div className="relative z-10">
        <ProcessSection />
      </div>
    </LandingSection>
  );
}
