"use client";

import { motion } from "framer-motion";
import { Play, Star } from "lucide-react";
import { SectionHeader, SectionWrapper } from "../ui/section-wrapper";
import { TESTIMONIALS } from "../constants";

export function TestimonialsSection() {
  return (
    <SectionWrapper id="testimonials" className="bg-gray-50/50">
      <SectionHeader
        badge="Testimonials"
        title="Trusted by Salon Leaders"
        subtitle="See why 1,000+ salon owners chose Salon AI to power their business."
      />

      {/* Google rating banner */}
      <div className="mx-auto mb-12 flex max-w-md items-center justify-center gap-4 rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
          <span className="text-lg font-bold text-blue-600">G</span>
        </div>
        <div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-1 text-sm font-bold text-gray-900">4.9</span>
          </div>
          <p className="text-xs text-gray-500">Based on 500+ Google reviews</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="flex flex-col rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
          >
            <div className="mb-4 flex gap-0.5">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <blockquote className="flex-1 text-sm leading-relaxed text-gray-600">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-emerald-500 text-sm font-bold text-white">
                {t.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                <div className="text-xs text-gray-500">{t.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Video testimonial placeholders */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {["Customer Story: Luxe Hair", "How Urban Barber Scaled", "Glow Spa's AI Journey"].map(
          (title) => (
            <div
              key={title}
              className="group relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-100 to-emerald-50"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg transition group-hover:scale-110">
                <Play className="h-6 w-6 text-violet-600" />
              </div>
              <span className="absolute bottom-4 left-4 text-sm font-semibold text-gray-700">
                {title}
              </span>
            </div>
          )
        )}
      </div>
    </SectionWrapper>
  );
}
