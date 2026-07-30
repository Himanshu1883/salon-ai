"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Star } from "lucide-react";
import { GOOGLE_REVIEWS, TESTIMONIALS } from "../constants";
import { SectionWrapper } from "../ui/section-wrapper";

export function TestimonialsSection() {
  return (
    <SectionWrapper id="testimonials" className="bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center md:mb-16">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-600">
            Trusted by Salon Owners
          </p>
          <h2 className="font-serif text-3xl font-bold text-gray-900 md:text-5xl lg:text-6xl">
            Real Stories. Real Results.
          </h2>
        </div>

        {/* Google reviews bar */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-2xl font-bold text-gray-900">{GOOGLE_REVIEWS.rating}</span>
          <span className="text-gray-500">from {GOOGLE_REVIEWS.count}+ Google reviews</span>
          <div className="hidden h-6 w-px bg-gray-200 md:block" />
          <div className="flex flex-wrap gap-2">
            {GOOGLE_REVIEWS.highlights.map((h) => (
              <span key={h} className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
                &ldquo;{h}&rdquo;
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-100"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Portrait photo */}
                <div className="relative h-48 w-full shrink-0 sm:h-auto sm:w-44 md:w-52">
                  <Image
                    src={t.image}
                    alt={t.alt}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                  {/* Video placeholder overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                      <Play className="h-5 w-5 fill-emerald-600 text-emerald-600" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-2 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="flex-1 text-gray-700 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-4 border-t pt-4">
                    <div className="font-semibold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">
                      {t.role}, {t.salon}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
