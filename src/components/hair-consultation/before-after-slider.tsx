"use client";

import { cn } from "@/lib/utils";

type BeforeAfterSliderProps = {
  beforeUrl: string;
  afterUrl: string;
  className?: string;
};

export function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  className,
}: BeforeAfterSliderProps) {
  return (
    <div
      className={cn(
        "relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#0C0A09]",
        className
      )}
    >
      <img
        src={afterUrl}
        alt="AI preview"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: "inset(0 50% 0 0)" }}
      >
        <img
          src={beforeUrl}
          alt="Original"
          className="h-full w-full object-cover"
        />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        defaultValue={50}
        aria-label="Compare before and after"
        className="absolute inset-x-4 bottom-4 z-10 h-2 w-[calc(100%-2rem)] cursor-ew-resize accent-[#7C3AED]"
        onChange={(e) => {
          const pct = Number(e.target.value);
          const clip = e.target.parentElement?.querySelector("div");
          if (clip) {
            (clip as HTMLElement).style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
          }
        }}
      />
      <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
        Before
      </div>
      <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-[#7C3AED]/90 px-2 py-1 text-xs text-white">
        After
      </div>
    </div>
  );
}
