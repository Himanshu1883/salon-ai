"use client";

import { Textarea } from "@/components/ui/textarea";

type NotesSectionProps = {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
};

export function NotesSection({
  id,
  label = "Notes (optional)",
  value,
  onChange,
  maxLength,
  placeholder = "Additional notes...",
}: NotesSectionProps) {
  return (
    <section aria-labelledby={`${id}-label`}>
      <h3
        id={`${id}-label`}
        className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
      >
        {label}
      </h3>
      <div className="relative">
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder={placeholder}
          rows={3}
          className="min-h-[96px] resize-none rounded-[14px] border-[#E5E7EB] bg-white px-4 py-3 text-sm focus-visible:border-[#6D5DF6]/40 focus-visible:ring-2 focus-visible:ring-[#6D5DF6]/20"
        />
        <span className="absolute bottom-3 right-3 text-xs text-[#9CA3AF]">
          {value.length}/{maxLength}
        </span>
      </div>
    </section>
  );
}
