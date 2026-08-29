"use client";

import { useEffect, useRef, useState } from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IndianTimeSelect } from "@/components/ui/indian-time-select";
import { cn } from "@/lib/utils";

function toDateYmd(value: string): string {
  if (!value) return "";
  const isoDate = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoDate) return isoDate[1];
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return format(parsed, "yyyy-MM-dd");
}

function toTime24(value: string): string {
  if (!value) return "10:00";
  if (/^\d{2}:\d{2}$/.test(value)) return value;
  const match = value.match(/T(\d{2}:\d{2})/);
  return match?.[1] ?? "10:00";
}

function composeDateTimeLocal(dateYmd: string, time24: string): string {
  if (!dateYmd || !time24) return "";
  return `${dateYmd}T${time24}`;
}

function formatIndianDateDisplay(dateYmd: string): string {
  if (!dateYmd) return "";
  const parsed = parse(dateYmd, "yyyy-MM-dd", new Date());
  if (!isValid(parsed)) return "";
  return format(parsed, "dd/MM/yyyy");
}

function formatIndianDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function isCompleteIndianDateInput(input: string): boolean {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(input.trim());
}

function parseIndianDateInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parsed = parse(trimmed, "dd/MM/yyyy", new Date());
  if (isValid(parsed)) {
    return format(parsed, "yyyy-MM-dd");
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return trimmed;

  return null;
}

type IndianDateTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  required?: boolean;
  onTimeMenuOpenChange?: (open: boolean) => void;
};

export function IndianDateTimePicker({
  value,
  onChange,
  disabled,
  id = "scheduledAt",
  required,
  onTimeMenuOpenChange,
}: IndianDateTimePickerProps) {
  const nativeDateRef = useRef<HTMLInputElement>(null);
  const [dateYmd, setDateYmd] = useState(() => toDateYmd(value));
  const [time24, setTime24] = useState(() => toTime24(value));
  const [dateInput, setDateInput] = useState(() =>
    formatIndianDateDisplay(toDateYmd(value))
  );
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    const nextDate = toDateYmd(value);
    const nextTime = toTime24(value);
    setDateYmd(nextDate);
    setTime24(nextTime);
    setDateInput(formatIndianDateDisplay(nextDate));
    setDateError("");
  }, [value]);

  const composed = composeDateTimeLocal(dateYmd, time24);

  function emit(nextDate: string, nextTime: string) {
    onChange(composeDateTimeLocal(nextDate, nextTime));
  }

  function handleDateInputChange(raw: string) {
    const next = formatIndianDateInput(raw);
    setDateInput(next);
    setDateError("");

    if (!next.trim()) {
      setDateYmd("");
      emit("", time24);
      return;
    }

    if (!isCompleteIndianDateInput(next)) {
      return;
    }

    const parsed = parseIndianDateInput(next);
    if (!parsed) {
      setDateYmd("");
      setDateError("Enter a valid date (DD/MM/YYYY)");
      emit("", time24);
      return;
    }

    setDateYmd(parsed);
    emit(parsed, time24);
  }

  function handleDateInputBlur() {
    if (!dateInput.trim()) return;
    if (isCompleteIndianDateInput(dateInput)) return;
    setDateError("Use DD/MM/YYYY format");
  }

  function handleNativeDateChange(next: string) {
    setDateYmd(next);
    setDateInput(formatIndianDateDisplay(next));
    setDateError("");
    emit(next, time24);
  }

  function handleTimeChange(next: string) {
    setTime24(next);
    emit(dateYmd, next);
  }

  return (
    <div className="space-y-3">
      <input type="hidden" id={id} name={id} value={composed} required={required} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${id}-date`}>Date</Label>
          <div className="relative">
            <Input
              id={`${id}-date`}
              value={dateInput}
              onChange={(e) => handleDateInputChange(e.target.value)}
              onBlur={handleDateInputBlur}
              placeholder="DD/MM/YYYY"
              inputMode="numeric"
              maxLength={10}
              disabled={disabled}
              required={required}
              className={cn(
                "h-11 rounded-xl border-stone-200 bg-stone-50/50 pr-10 focus:border-violet-300 focus:ring-violet-100",
                dateError && "border-red-300"
              )}
            />
            <button
              type="button"
              onClick={() => nativeDateRef.current?.showPicker?.()}
              disabled={disabled}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-violet-500 hover:bg-violet-50 disabled:opacity-50"
              title="Pick date"
            >
              <CalendarDays className="h-4 w-4" />
            </button>
            <input
              ref={nativeDateRef}
              type="date"
              value={dateYmd}
              onChange={(e) => handleNativeDateChange(e.target.value)}
              disabled={disabled}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
            />
          </div>
          {dateError && <p className="text-xs text-red-600">{dateError}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${id}-time`}>Time</Label>
          <IndianTimeSelect
            value={time24}
            onChange={handleTimeChange}
            disabled={disabled}
            onOpenChange={onTimeMenuOpenChange}
          />
        </div>
      </div>
    </div>
  );
}

export function parseDateTimeLocalValue(value: string): {
  dateYmd: string;
  time24: string;
} {
  return {
    dateYmd: toDateYmd(value),
    time24: toTime24(value),
  };
}
