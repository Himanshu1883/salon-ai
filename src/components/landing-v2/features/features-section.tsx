"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { FEATURE_BLOCKS } from "../constants";
import { SectionWrapper } from "../ui/section-wrapper";
import { cn } from "@/lib/utils";

export function FeaturesSection() {
  return (
    <SectionWrapper id="features" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-600">
            Salon-First Features
          </p>
          <h2 className="font-serif text-3xl font-bold text-gray-900 md:text-5xl lg:text-6xl">
            Designed Around Your Salon Floor
          </h2>
        </div>

        <div className="space-y-8 md:space-y-12 lg:space-y-16">
          {FEATURE_BLOCKS.map((block, i) => {
            const reversed = i % 2 === 1;
            return (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7 }}
                className={cn(
                  "grid items-center gap-8 md:gap-12 lg:grid-cols-2 lg:gap-16",
                  reversed && "lg:[direction:rtl]"
                )}
              >
                {/* Large photo */}
                <div className="relative h-72 overflow-hidden rounded-3xl shadow-2xl md:h-96 lg:h-[480px] lg:[direction:ltr]">
                  <Image
                    src={block.image}
                    alt={block.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent" />
                </div>

                {/* Text */}
                <div className="lg:[direction:ltr]">
                  <h3 className="font-serif text-2xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
                    {block.title}
                  </h3>
                  <p className="mt-4 text-lg leading-relaxed text-gray-600 md:text-xl">
                    {block.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {block.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-3 text-gray-700">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
