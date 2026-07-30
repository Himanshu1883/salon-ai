"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SALON_TYPES } from "../constants";
import { SectionWrapper } from "../ui/section-wrapper";

export function SalonTypesSection() {
  return (
    <SectionWrapper id="salon-types" className="bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center md:mb-16">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-rose-400">
            Built For Every Salon
          </p>
          <h2 className="font-serif text-3xl font-bold text-gray-900 md:text-5xl lg:text-6xl">
            Your Salon Type. Fully Supported.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {SALON_TYPES.map((type, i) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.03 }}
              className="group relative h-64 overflow-hidden rounded-2xl shadow-lg md:h-72 lg:h-80"
            >
              <Image
                src={type.image}
                alt={type.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-serif text-xl font-bold text-white md:text-2xl">
                  {type.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
