"use client";

import { Textarea } from "@/components/ui/textarea";
import { invoiceModalStyles } from "./styles";

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
      <div className="mb-5 flex items-center gap-3">
        <div
          className="h-5 w-1 shrink-0 rounded-full bg-gradient-to-b from-violet-500 to-violet-400"
          aria-hidden
        />
        <h3 id={`${id}-label`} className={invoiceModalStyles.sectionTitle}>
          {label}
        </h3>
      </div>
      <div className="relative">
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder={placeholder}
          rows={3}
          className={invoiceModalStyles.textarea}
        />
        <span className="absolute bottom-3.5 right-3.5 text-xs text-dashboard-muted">
          {value.length}/{maxLength}
        </span>
      </div>
    </section>
  );
}
