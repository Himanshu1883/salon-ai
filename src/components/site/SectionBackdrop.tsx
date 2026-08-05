"use client";

import { useId } from "react";

type BackdropVariant =
  | "mesh"
  | "grid"
  | "dots"
  | "pricing"
  | "testimonials"
  | "salon-types"
  | "features"
  | "faq"
  | "strip";

const PHOTOS: Partial<Record<BackdropVariant, string>> = {
  testimonials:
    "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=1920&q=80",
  "salon-types":
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80",
  features:
    "https://images.unsplash.com/photo-1521594698603-765d672d4e8e?auto=format&fit=crop&w=1920&q=80",
};

type WaveIntensity = "soft" | "medium";

function FlowWaves({
  intensity = "soft",
  flip,
  layers = 2,
}: {
  intensity?: WaveIntensity;
  flip?: boolean;
  layers?: 1 | 2;
}) {
  const uid = useId().replace(/:/g, "");
  const opacity = intensity === "medium" ? 0.09 : 0.06;

  return (
    <div
      className={`saas-wave-stack absolute inset-0 ${flip ? "saas-wave-stack-flip" : ""}`}
    >
      <svg
        className="saas-wave saas-wave-a absolute -left-[6%] bottom-0 h-[42%] w-[112%]"
        viewBox="0 0 1440 420"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={`${uid}-a`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.44 0.208 296)" stopOpacity={opacity * 0.7} />
            <stop offset="100%" stopColor="oklch(0.62 0.2 298)" stopOpacity={opacity} />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${uid}-a)`}
          d="M0,220 C180,120 360,320 540,240 C720,160 900,300 1080,220 C1260,140 1350,260 1440,200 L1440,420 L0,420 Z"
        />
      </svg>

      {layers === 2 && (
        <svg
          className="saas-wave saas-wave-b absolute -right-[4%] bottom-[6%] h-[34%] w-[108%]"
          viewBox="0 0 1440 380"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id={`${uid}-b`} x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.62 0.2 298)" stopOpacity={opacity * 0.75} />
              <stop offset="100%" stopColor="oklch(0.462 0.072 168)" stopOpacity={opacity * 0.4} />
            </linearGradient>
          </defs>
          <path
            fill={`url(#${uid}-b)`}
            d="M0,260 C240,180 420,340 660,260 C900,180 1080,320 1320,240 C1380,220 1410,250 1440,230 L1440,380 L0,380 Z"
          />
        </svg>
      )}
    </div>
  );
}

function RippleFlow() {
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      className="saas-ripple saas-ripple-a absolute inset-x-[-8%] top-[22%] h-[28%] w-[116%]"
      viewBox="0 0 1200 300"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${uid}-r1`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="25%" stopColor="oklch(0.62 0.2 298)" stopOpacity="0.07" />
          <stop offset="75%" stopColor="oklch(0.44 0.208 296)" stopOpacity="0.05" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        fill="none"
        stroke={`url(#${uid}-r1)`}
        strokeWidth="1.5"
        d="M0,150 C150,80 300,220 450,150 C600,80 750,220 900,150 C1050,80 1200,180 1200,150"
      />
    </svg>
  );
}

export function SectionBackdrop({
  variant = "mesh",
  className = "",
  fadeFrom = "background",
  image,
}: {
  variant?: BackdropVariant;
  className?: string;
  fadeFrom?: "background" | "card" | "none";
  image?: string;
}) {
  const photo = image ?? PHOTOS[variant];
  const showWaves = ["mesh", "features", "pricing", "salon-types"].includes(variant);
  const waveIntensity: WaveIntensity = variant === "mesh" ? "medium" : "soft";

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <div className="saas-flow-mesh absolute inset-0" />

      {photo && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.04] mix-blend-multiply"
          style={{ backgroundImage: `url(${photo})` }}
        />
      )}

      {variant === "strip" && <div className="saas-flow-band absolute inset-0" />}

      {showWaves && (
        <FlowWaves
          intensity={waveIntensity}
          flip={variant === "salon-types"}
          layers={variant === "mesh" ? 2 : 1}
        />
      )}

      {(variant === "testimonials" || variant === "faq") && <RippleFlow />}

      {variant !== "strip" && (
        <>
          <div className="saas-flow-orb saas-flow-orb-a absolute -top-16 -right-16 h-72 w-72 rounded-full bg-primary/6 blur-3xl" />
          <div className="saas-flow-orb saas-flow-orb-b absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl" />
        </>
      )}

      {fadeFrom !== "none" &&
        (fadeFrom === "card" ? (
          <>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent" />
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-card/90 to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background/90 to-transparent" />
          </>
        ))}
    </div>
  );
}
