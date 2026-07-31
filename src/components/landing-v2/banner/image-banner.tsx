"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type ImageBannerProps = {
  image: string;
  alt: string;
  text: string;
  height?: "md" | "lg";
  priority?: boolean;
};

export function ImageBanner({
  image,
  alt,
  text,
  height = "lg",
  priority = false,
}: ImageBannerProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section
      ref={ref}
      className={`relative w-full overflow-hidden ${
        height === "lg"
          ? "h-[55vh] min-h-[360px] md:h-[70vh] md:min-h-[480px] lg:min-h-[560px]"
          : "h-[45vh] min-h-[300px] md:h-[55vh] md:min-h-[400px]"
      }`}
    >
      <Image
        src={image}
        alt={alt}
        fill
        priority={priority}
        quality={90}
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-purple-950/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

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
