"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { v3 } from "./tokens";

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
  label = "Notes",
  value,
  onChange,
  maxLength,
  placeholder = "Add notes for this invoice…",
}: NotesSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.05 }}
      aria-labelledby={`${id}-label`}
      className={v3.section}
    >
      <h3 id={`${id}-label`} className={v3.sectionTitle}>
        📝 {label}
      </h3>

      <div className="relative">
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder={placeholder}
          rows={2}
          className={cn(v3.textarea, "w-full pb-6")}
        />
        <span className="absolute bottom-2 right-2.5 text-[10px] text-[#6B7280]">
          {value.length}/{maxLength}
        </span>
      </div>
    </motion.section>
  );
}
