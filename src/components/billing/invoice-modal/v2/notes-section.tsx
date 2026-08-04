"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { v2 } from "./tokens";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(100, el.scrollHeight)}px`;
  }, [value]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      aria-labelledby={`${id}-label`}
      className={v2.card}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 id={`${id}-label`} className={v2.sectionTitle}>
          {label}
        </h3>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-xs font-medium text-[#6B7280] transition-colors hover:bg-[#FAFBFF] hover:text-[#7C3AED]"
          onClick={() => {
            /* attachment MVP stub */
          }}
        >
          <Paperclip className="h-3.5 w-3.5" />
          Attach
        </button>
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder={placeholder}
          rows={3}
          className={cn(v2.textarea, "w-full pb-8")}
        />
        <span className="absolute bottom-3 right-3 text-xs text-[#6B7280]">
          {value.length}/{maxLength}
        </span>
      </div>
    </motion.section>
  );
}
