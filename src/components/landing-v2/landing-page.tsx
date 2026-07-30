"use client";

import dynamic from "next/dynamic";
import { Navbar } from "./navbar";
import { HeroSection } from "./hero/hero-section";
import { ImageBanner } from "./banner/image-banner";
import { BANNERS } from "./constants";
import { Footer } from "./footer/footer";

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
    <div className="landing-v2 min-h-screen bg-white text-gray-900 antialiased">
      <Navbar isAuthenticated={isAuthenticated} />
      <main>
        <HeroSection />
        <ImageBanner
          image={BANNERS[0].image}
          alt={BANNERS[0].alt}
          text={BANNERS[0].text}
        />
        <ModulesSection />
        <PreviewSection />
        <ImageBanner
          image={BANNERS[1].image}
          alt={BANNERS[1].alt}
          text={BANNERS[1].text}
        />
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
