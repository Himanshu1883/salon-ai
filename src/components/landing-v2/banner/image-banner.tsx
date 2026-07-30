"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type ImageBannerProps = {
  image: string;
  alt: string;
  text: string;
  height?: "md" | "lg";
};

export function ImageBanner({ image, alt, text, height = "lg" }: ImageBannerProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section
      ref={ref}
      className={`relative w-full overflow-hidden ${
        height === "lg" ? "h-[50vh] min-h-[320px] md:h-[60vh] md:min-h-[420px]" : "h-[40vh] min-h-[280px] md:h-[50vh]"
      }`}
    >
      <Image
        src={image}
        alt={alt}
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 flex items-center justify-center px-6"
      >
        <h2 className="max-w-4xl text-center font-serif text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
          {text}
        </h2>
      </motion.div>
    </section>
  );
}
