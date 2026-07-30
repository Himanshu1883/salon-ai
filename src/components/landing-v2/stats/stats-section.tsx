"use client";

import { SectionWrapper } from "../ui/section-wrapper";
import { AnimatedCounter } from "../ui/animated-counter";
import { STATS } from "../constants";

export function StatsSection() {
  return (
    <SectionWrapper className="border-y border-gray-100 bg-white py-16 md:py-20">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-5 md:gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              <AnimatedCounter
                value={stat.value}
                suffix={stat.suffix}
                decimals={"decimals" in stat ? stat.decimals : 0}
                multiplier={"multiplier" in stat ? stat.multiplier : 1}
              />
            </div>
            <div className="mt-2 text-sm font-medium text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
