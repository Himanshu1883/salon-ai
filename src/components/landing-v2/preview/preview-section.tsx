"use client";

import { LandingSection, SectionHeader } from "../ui/landing-primitives";
import { PreviewShowcase } from "./preview-showcase";

export function PreviewSection() {
  return (
    <LandingSection id="preview" band="band" className="!py-14 md:!py-20 lg:!py-24">
      <SectionHeader
        eyebrow="Platform Preview"
        title="See It In Action"
        subtitle="Explore every corner of your salon command center."
        className="!mb-8 md:!mb-10"
      />

      <PreviewShowcase />
    </LandingSection>
  );
}
