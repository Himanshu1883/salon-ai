"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type FloatingInputProps = {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  icon?: LucideIcon;
  placeholder?: string;
  className?: string;
  autoComplete?: string;
};

export function FloatingInput({
  id,
  name,
  label,
  value,
  onChange,
  type = "text",
  required,
  icon: Icon,
  placeholder,
  className,
  autoComplete,
}: FloatingInputProps) {
  return (
    <div className={cn("relative", className)}>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder ?? " "}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "peer h-14 w-full rounded-2xl border border-[#E8ECF4] bg-white px-4 pt-5 pb-2 text-sm text-[#1C103D] shadow-sm transition-all",
          "placeholder:text-transparent focus:border-[#6C3BFF]/40 focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/20",
          Icon && "pr-11"
        )}
      />
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF] transition-all",
          "peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-[#6C3BFF]",
          "peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs"
        )}
      >
        {label}
        {required && " *"}
      </label>
      {Icon && (
        <Icon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
      )}
    </div>
  );
}
