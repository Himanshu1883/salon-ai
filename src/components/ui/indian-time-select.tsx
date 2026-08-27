"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Clock, Settings2 } from "lucide-react";
import {
  formatIndianTimeDisplay,
  time12To24,
  time24To12,
  type Time12Hour,
} from "@/lib/team";
import { handleScrollContainerWheel } from "@/lib/indian-time-menu";
import { cn } from "@/lib/utils";

const TIME_SLOTS: string[] = [];
for (let hour = 0; hour < 24; hour += 1) {
  for (const minute of [0, 30]) {
    TIME_SLOTS.push(
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
    );
  }
}

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => i);
const LIST_MAX_HEIGHT = 208;
const MENU_CHROME_HEIGHT = 110;

function slotsForPeriod(period: "AM" | "PM", includeValue?: string) {
  const slots = TIME_SLOTS.filter((slot) => {
    const hour = parseInt(slot.split(":")[0] ?? "0", 10);
    return period === "AM" ? hour < 12 : hour >= 12;
  });

  if (
    includeValue &&
    !slots.includes(includeValue) &&
    ((period === "AM" &&
      parseInt(includeValue.split(":")[0] ?? "0", 10) < 12) ||
      (period === "PM" &&
        parseInt(includeValue.split(":")[0] ?? "0", 10) >= 12))
  ) {
    return [...slots, includeValue].sort();
  }

  return slots;
}

function isPresetSlot(time24: string): boolean {
  return TIME_SLOTS.includes(time24);
}

function CustomTimeFields({
  value,
  onChange,
}: {
  value: Time12Hour;
  onChange: (value: Time12Hour) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <select
        value={value.hour}
        onChange={(e) =>
          onChange({ ...value, hour: parseInt(e.target.value, 10) })
        }
        className="h-9 w-[3.25rem] rounded-lg border border-stone-200 bg-white px-2 text-sm text-stone-700 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
        aria-label="Hour"
      >
        {HOUR_OPTIONS.map((hour) => (
          <option key={hour} value={hour}>
            {String(hour).padStart(2, "0")}
          </option>
        ))}
      </select>
      <span className="text-stone-400">:</span>
      <select
        value={value.minute}
        onChange={(e) =>
          onChange({ ...value, minute: parseInt(e.target.value, 10) })
        }
        className="h-9 w-[3.25rem] rounded-lg border border-stone-200 bg-white px-2 text-sm text-stone-700 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
        aria-label="Minute"
      >
        {MINUTE_OPTIONS.map((minute) => (
          <option key={minute} value={minute}>
            {String(minute).padStart(2, "0")}
          </option>
        ))}
      </select>
      <div className="flex gap-1">
        {(["AM", "PM"] as const).map((period) => (
          <button
            key={period}
            type="button"
            onClick={() => onChange({ ...value, period })}
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
              value.period === period
                ? "bg-violet-600 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            )}
          >
            {period}
          </button>
        ))}
      </div>
    </div>
  );
}

type IndianTimeSelectProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  allowCustomTime?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function IndianTimeSelect({
  value,
  onChange,
  disabled,
  className,
  allowCustomTime = true,
  onOpenChange,
}: IndianTimeSelectProps) {
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [period, setPeriod] = useState<"AM" | "PM">(() => time24To12(value).period);
  const [draftCustom, setDraftCustom] = useState<Time12Hour>(() => time24To12(value));
  const rootRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

  function setMenuOpen(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
    if (!next) setCustomMode(false);
  }

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setPeriod(time24To12(value).period);
      setDraftCustom(time24To12(value));
      setCustomMode(!isPresetSlot(value));
    }
    wasOpenRef.current = open;
  }, [open, value]);

  useEffect(() => {
    if (!open || !rootRef.current) return;

    const rect = rootRef.current.getBoundingClientRect();
    const menuHeight = customMode ? 160 : LIST_MAX_HEIGHT + MENU_CHROME_HEIGHT;
    const spaceBelow = window.innerHeight - rect.bottom;
    setOpenUpward(spaceBelow < menuHeight + 16);
  }, [open, customMode]);

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      setMenuOpen(false);
    }

    if (open) {
      document.addEventListener("mousedown", handleMouseDown);
    }
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  const filteredSlots = useMemo(
    () => slotsForPeriod(period, value),
    [period, value]
  );

  function openCustomMode() {
    setDraftCustom(time24To12(value));
    setCustomMode(true);
  }

  function applyCustomTime() {
    onChange(
      time12To24(draftCustom.hour, draftCustom.minute, draftCustom.period)
    );
    setMenuOpen(false);
  }

  return (
    <div ref={rootRef} className="relative overflow-visible">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setMenuOpen(!open)}
        className={cn(
          "flex h-11 w-full items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-700 transition-colors",
          disabled
            ? "cursor-not-allowed opacity-50"
            : "hover:border-violet-200 hover:bg-violet-50/40",
          open && !disabled && "border-violet-300 ring-2 ring-violet-100",
          className
        )}
      >
        <Clock className="h-4 w-4 shrink-0 text-violet-500" />
        <span className="flex-1 truncate text-left font-medium">
          {formatIndianTimeDisplay(value)}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-stone-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && !disabled && (
        <div
          className={cn(
            "absolute z-[200] w-full min-w-[240px] rounded-xl border border-stone-200 bg-white shadow-xl shadow-violet-500/10",
            openUpward ? "bottom-full mb-1.5" : "top-full mt-1.5"
          )}
        >
          {customMode ? (
            <div className="p-3">
              <div className="mb-3 flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-violet-500" />
                <p className="text-sm font-semibold text-[#1C103D]">
                  Custom time
                </p>
              </div>
              <CustomTimeFields value={draftCustom} onChange={setDraftCustom} />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setCustomMode(false)}
                  className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={applyCustomTime}
                  className="flex-1 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700"
                >
                  Apply
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-stone-100 bg-stone-50 p-1.5">
                <div className="flex gap-1">
                  {(["AM", "PM"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setPeriod(tab)}
                      className={cn(
                        "flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors",
                        period === tab
                          ? "bg-violet-600 text-white shadow-sm"
                          : "text-stone-500 hover:bg-white hover:text-stone-700"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{ maxHeight: LIST_MAX_HEIGHT }}
                className="touch-pan-y overflow-y-auto overscroll-contain p-1 [scrollbar-width:thin] [scrollbar-color:#c4b5fd_#f5f3ff] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-violet-300 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-violet-50"
                onWheel={handleScrollContainerWheel}
              >
                {filteredSlots.map((slot) => {
                  const selected = slot === value;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        onChange(slot);
                        setMenuOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                        selected
                          ? "bg-violet-600 font-medium text-white"
                          : "text-stone-700 hover:bg-violet-50"
                      )}
                    >
                      <span>{formatIndianTimeDisplay(slot)}</span>
                      {selected && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>

              {allowCustomTime && (
                <div className="border-t border-stone-100 bg-white p-1.5">
                  <button
                    type="button"
                    onClick={openCustomMode}
                    className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-50 active:bg-violet-100"
                  >
                    <Settings2 className="h-4 w-4" />
                    Custom time
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
