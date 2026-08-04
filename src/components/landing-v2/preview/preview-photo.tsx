"use client";

import Image, { type StaticImageData } from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ProcessStep = {
  index: string;
  title: string;
  description: string;
  tag: string;
  icon?: React.ReactNode;
  image: string | StaticImageData;
};

const PROCESS_STEPS: ProcessStep[] = [
  {
    index: "01",
    title: "Discover Your Salon",
    description:
      "We map every chair, service, and staff schedule you run today, so nothing gets lost when you move to Gotix.",
    tag: "Onboarding",
    image: "/salon.jpg",
  },
  {
    index: "02",
    title: "Set Up & Migrate",
    description:
      "Your clients, services, staff, and inventory are imported and configured — dashboard, POS, and CRM ready on day one.",
    tag: "Migration",
    image: "/salon2.jpg",
  },
  {
    index: "03",
    title: "Train Your Team",
    description:
      "Front desk, stylists, and managers get hands-on walkthroughs, so every booking and bill runs smoothly from day one.",
    tag: "Training",
    image: "/salon3.jpg",
  },
  {
    index: "04",
    title: "Launch & Scale",
    description:
      "Go live with real-time analytics running from day one. We stay on to optimize as your salon grows across locations.",
    tag: "Growth",
    image: "/salon4.jpg",
  },
];

export function ProcessSection() {
  // FIXED Animation Config
  // "as const" tells TypeScript that this is a fixed 4-number tuple, not a generic array.
  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { 
      duration: 0.6, 
      delay, 
      ease: [0.22, 1, 0.36, 1] as const 
    },
  });

  return (
    <section className="relative bg-[#F8F9FC] py-20 md:py-28 lg:py-36 overflow-hidden">
      {/* Background ambient glow - matching your existing theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#EDE9FE] blur-[120px] opacity-60 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        
        {/* Header */}
        <div className="mb-12 lg:mb-16">
          <motion.div {...fadeUp(0)}>
            <span className="inline-block rounded-full bg-[#E9D5FF] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#7C3AED]">
              The Process
            </span>
          </motion.div>
          <motion.h2 
            {...fadeUp(0.1)}
            className="mt-4 text-3xl md:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-[#1B1714]"
          >
            What it&apos;s like working with Gotix
          </motion.h2>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Column 1: Quote Block (Theme Purple) */}
          <motion.div 
            {...fadeUp(0.2)}
            className="lg:col-span-4 bg-[#EDE9FE] rounded-3xl p-8 lg:p-10 flex flex-col justify-between shadow-sm border border-[#7C3AED]/10"
          >
            <div>
              {/* Dynamic Quote based on Step 01 */}
              <p className="text-lg md:text-xl leading-relaxed text-[#1B1714] font-medium">
                “{PROCESS_STEPS[0].description}”
              </p>
            </div>
            
            <div className="mt-8 flex items-end justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1B1714]">Step {PROCESS_STEPS[0].index}</p>
                <p className="text-xs text-[#7C3AED] font-medium">{PROCESS_STEPS[0].tag}</p>
              </div>
              
              {/* Logo Placeholder */}
              <div className="h-10 w-24 relative flex-shrink-0 bg-[#7C3AED]/10 rounded-lg flex items-center justify-center px-2">
                 <span className="text-[8px] font-bold uppercase text-[#7C3AED]/60 text-center leading-tight">
                   Gotix<br/>System
                 </span>
              </div>
            </div>
          </motion.div>

          {/* Column 2: Main Image Block */}
          <motion.div 
            {...fadeUp(0.3)}
            className="lg:col-span-4 rounded-3xl overflow-hidden relative shadow-sm border border-[#7C3AED]/10 min-h-[300px] lg:min-h-[400px]"
          >
            <Image
              src={PROCESS_STEPS[0].image}
              alt="Modern luxury salon interior"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Subtle purple overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#7C3AED]/5 to-transparent mix-blend-multiply" />
          </motion.div>

          {/* Column 3: Stats & CTA Block (Theme Lighter Purple) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Stat 1 - Based on Step 02 */}
            <motion.div 
              {...fadeUp(0.4)}
              className="bg-[#F3E8FF] rounded-3xl p-8 lg:p-10 shadow-sm border border-[#7C3AED]/10"
            >
              <p className="text-4xl lg:text-5xl font-serif font-medium text-[#7C3AED] mb-2">
                {PROCESS_STEPS[1].index}
              </p>
              <p className="text-sm text-[#1B1714]/70 leading-relaxed max-w-xs">
                <span className="font-semibold text-[#1B1714]">{PROCESS_STEPS[1].title}:</span> {PROCESS_STEPS[1].description}
              </p>
            </motion.div>

            {/* Stat 2 - Based on Step 03 */}
            <motion.div 
              {...fadeUp(0.5)}
              className="bg-[#F3E8FF] rounded-3xl p-8 lg:p-10 shadow-sm border border-[#7C3AED]/10"
            >
              <p className="text-4xl lg:text-5xl font-serif font-medium text-[#7C3AED] mb-2">
                {PROCESS_STEPS[2].index}
              </p>
              <p className="text-sm text-[#1B1714]/70 leading-relaxed max-w-xs">
                <span className="font-semibold text-[#1B1714]">{PROCESS_STEPS[2].title}:</span> {PROCESS_STEPS[2].description}
              </p>
            </motion.div>

            {/* CTA Block - Based on Step 04 */}
            <motion.div 
              {...fadeUp(0.6)}
            >
              <button
                className={cn(
                  "group w-full flex items-center justify-between rounded-3xl bg-[#1B1714] p-6 lg:p-8 transition-all duration-300 hover:bg-[#2a2522] shadow-lg",
                  "lg:max-w-full"
                )}
              >
                <span className="text-lg font-medium text-white font-serif tracking-tight">
                  {PROCESS_STEPS[3].title}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight className="h-5 w-5 text-white" />
                </div>
              </button>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}