"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { AI_SECTION, IMAGES } from "../constants";
import {
  ContainedPhoto,
  LandingCard,
  LandingSection,
  SectionEyebrow,
  sectionHeadingClass,
} from "../ui/landing-primitives";
import { ProductMockupFrame } from "../ui/product-mockup-frame";

export function AiSection() {
  return (
    <LandingSection id="ai" band="ivory" className="bg-white">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionEyebrow centered={false}>Artificial Intelligence</SectionEyebrow>
          <h2 className={sectionHeadingClass}>{AI_SECTION.heading}</h2>
          <p className="mt-5 text-base leading-relaxed text-[#1B1714]/65 md:text-lg">
            {AI_SECTION.subtitle}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {AI_SECTION.features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                >
                  <LandingCard className="h-full p-5">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#2F6F5E]/10 text-[#2F6F5E]">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <h3 className="font-semibold text-[#1B1714]">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#1B1714]/65">{f.desc}</p>
                  </LandingCard>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <ContainedPhoto
            src={IMAGES.hairStyling}
            alt="AI-powered salon styling session"
            aspect="video"
            className="h-48 md:h-56"
          />
          <div className="relative">
            <div className="mb-3 inline-flex items-center gap-2 text-[#2F6F5E]">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">AI Analytics</span>
            </div>
            <ProductMockupFrame variant="dashboard" showChrome />
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
