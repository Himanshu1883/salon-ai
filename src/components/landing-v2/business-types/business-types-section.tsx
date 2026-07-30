"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SectionHeader, SectionWrapper } from "../ui/section-wrapper";
import { BUSINESS_TYPES } from "../constants";

export function BusinessTypesSection() {
  return (
    <SectionWrapper id="industries">
      <SectionHeader
        badge="Industries"
        title="Built for Every Salon Business"
        subtitle="Whether you run a single chair or a franchise network, Salon AI adapts to your business type."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BUSINESS_TYPES.map((type, i) => (
          <motion.div
            key={type.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-2xl"
          >
            <div className="relative aspect-[3/2] overflow-hidden">
              <Image
                src={type.image}
                alt={type.name}
                fill
                loading="lazy"
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h3 className="text-lg font-bold text-white">{type.name}</h3>
              <p className="mt-1 text-sm text-white/70 opacity-0 transition group-hover:opacity-100">
                Full ERP suite tailored for {type.name.toLowerCase()} operations
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
