import {
  Droplets,
  Flower2,
  Hand,
  Palette,
  Scissors,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { CheckInService, ServiceCategoryFilter } from "./types";

export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

export function getServiceIcon(category: string): LucideIcon {
  const key = category.toLowerCase();
  if (key.includes("color") || key.includes("highlight")) return Palette;
  if (key.includes("spa") || key.includes("massage")) return Flower2;
  if (key.includes("facial") || key.includes("skin")) return Droplets;
  if (key.includes("nail")) return Hand;
  if (key.includes("popular") || key.includes("premium")) return Star;
  return Scissors;
}

export function getServiceIconColors(category: string): {
  bg: string;
  text: string;
} {
  const key = category.toLowerCase();
  if (key.includes("color")) return { bg: "bg-[#FEF3C7]", text: "text-[#D97706]" };
  if (key.includes("spa")) return { bg: "bg-[#D1FAE5]", text: "text-[#059669]" };
  if (key.includes("facial")) return { bg: "bg-[#DBEAFE]", text: "text-[#2563EB]" };
  if (key.includes("nail")) return { bg: "bg-[#FCE7F3]", text: "text-[#DB2777]" };
  return { bg: "bg-[#EDE9FE]", text: "text-[#6C3BFF]" };
}

export function filterServices(
  services: CheckInService[],
  search: string,
  category: ServiceCategoryFilter
): CheckInService[] {
  let filtered = services;

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }

  if (category === "Popular") {
    const sorted = [...services].sort((a, b) => b.price - a.price);
    const popularIds = new Set(sorted.slice(0, Math.min(6, sorted.length)).map((s) => s.id));
    filtered = filtered.filter((s) => popularIds.has(s.id));
  } else {
    filtered = filtered.filter((s) =>
      s.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  return filtered;
}

export function isPopularService(service: CheckInService, allServices: CheckInService[]): boolean {
  const sorted = [...allServices].sort((a, b) => b.price - a.price);
  const popularIds = new Set(sorted.slice(0, Math.min(6, sorted.length)).map((s) => s.id));
  return popularIds.has(service.id);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function computeEstimatedFinish(totalMinutes: number): Date {
  const finish = new Date();
  finish.setMinutes(finish.getMinutes() + totalMinutes);
  return finish;
}

export const DRAFT_STORAGE_KEY = "salon-ai-check-in-draft";
