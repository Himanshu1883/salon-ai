"use client";

import { Navbar } from "./navbar";
import { HeroSection } from "./hero/hero-section";
import { HeroTrustBridge } from "./hero/hero-trust-bridge";
import { Footer } from "./footer/footer";
import dynamic from "next/dynamic";

const ModulesSection = dynamic(() =>
  import("./modules/modules-section").then((m) => ({ default: m.ModulesSection }))
);
const PreviewSection = dynamic(() =>
  import("./preview/preview-section").then((m) => ({ default: m.PreviewSection }))
);
const SalonTypesSection = dynamic(() =>
  import("./salon-types/salon-types-section").then((m) => ({ default: m.SalonTypesSection }))
);
const FeaturesSection = dynamic(() =>
  import("./features/features-section").then((m) => ({ default: m.FeaturesSection }))
);
const AiSection = dynamic(() =>
  import("./ai-section/ai-section").then((m) => ({ default: m.AiSection }))
);
const TestimonialsSection = dynamic(() =>
  import("./testimonials/testimonials-section").then((m) => ({ default: m.TestimonialsSection }))
);
const PricingSection = dynamic(() =>
  import("./pricing/pricing-section").then((m) => ({ default: m.PricingSection }))
);
const FaqSection = dynamic(() =>
  import("./faq/faq-section").then((m) => ({ default: m.FaqSection }))
);

type LandingPageV2Props = {
  isAuthenticated?: boolean;
};

export function LandingPageV2({ isAuthenticated = false }: LandingPageV2Props) {
  return (
    <div className="landing-v2 min-h-screen antialiased">
      <Navbar isAuthenticated={isAuthenticated} />
      <main>
        <div className="relative h-[100svh] max-h-[100svh] min-h-[100svh] overflow-x-hidden lg:h-[calc(100svh-var(--landing-trust-half))] lg:max-h-[calc(100svh-var(--landing-trust-half))] lg:min-h-[calc(100svh-var(--landing-trust-half))] lg:overflow-visible">
          <HeroSection />
          <HeroTrustBridge />
        </div>
        <ModulesSection />
        <PreviewSection />
        <SalonTypesSection />
        <FeaturesSection />
        <AiSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
