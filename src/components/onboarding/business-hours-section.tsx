"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarClock, Check, ChevronDown, Clock } from "lucide-react";
import {
  DAYS_OF_WEEK,
  type DayHours,
  type DayKey,
  type OpeningHours,
} from "@/lib/onboarding";
import { formatIndianTimeDisplay, time12To24, time24To12, type Time12Hour } from "@/lib/team";
import { cn } from "@/lib/utils";

const DAY_FULL_NAMES: Record<DayKey, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const DAY_INITIALS: Record<DayKey, string> = {
  monday: "M",
  tuesday: "T",
  wednesday: "W",
  thursday: "T",
  friday: "F",
  saturday: "S",
  sunday: "S",
};

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

function CustomTimeFields({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Time12Hour;
  onChange: (value: Time12Hour) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-stone-500">{label}</p>
      <div className="flex items-center gap-1.5">
        <select
          value={value.hour}
          onChange={(e) =>
            onChange({ ...value, hour: parseInt(e.target.value, 10) })
          }
          className="h-9 w-14 rounded-lg border border-stone-200 bg-white px-2 text-sm text-stone-700 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
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
          className="h-9 w-14 rounded-lg border border-stone-200 bg-white px-2 text-sm text-stone-700 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
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
    </div>
  );
}

function CustomTimeButton({
  openTime,
  closeTime,
  onApply,
  onApplyToAllDays,
  disabled,
}: {
  openTime: string;
  closeTime: string;
  onApply: (open: string, close: string) => void;
  onApplyToAllDays: (open: string, close: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [applyToAllDays, setApplyToAllDays] = useState(false);
  const [draftOpen, setDraftOpen] = useState<Time12Hour>(() => time24To12(openTime));
  const [draftClose, setDraftClose] = useState<Time12Hour>(() => time24To12(closeTime));
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, width: 280 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setDraftOpen(time24To12(openTime));
      setDraftClose(time24To12(closeTime));
      setApplyToAllDays(false);
    }
  }, [open, openTime, closeTime]);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      setMenuStyle({
        top: rect.bottom + 6,
        left: Math.max(8, rect.right - 280),
        width: 280,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleSubmit() {
    const openValue = time12To24(
      draftOpen.hour,
      draftOpen.minute,
      draftOpen.period
    );
    const closeValue = time12To24(
      draftClose.hour,
      draftClose.minute,
      draftClose.period
    );

    if (applyToAllDays) {
      onApplyToAllDays(openValue, closeValue);
    } else {
      onApply(openValue, closeValue);
    }

    setApplyToAllDays(false);
    setOpen(false);
  }

  const menu =
    open && !disabled ? (
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          top: menuStyle.top,
          left: menuStyle.left,
          width: menuStyle.width,
          zIndex: 9999,
        }}
        className="rounded-xl border border-stone-200 bg-white p-4 shadow-lg"
      >
        <p className="mb-3 text-sm font-semibold text-stone-900">Custom time</p>
        <div className="space-y-4">
          <CustomTimeFields
            label="Opening time"
            value={draftOpen}
            onChange={setDraftOpen}
          />
          <CustomTimeFields
            label="Closing time"
            value={draftClose}
            onChange={setDraftClose}
          />
        </div>
        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-stone-600">
          <input
            type="checkbox"
            checked={applyToAllDays}
            onChange={(e) => setApplyToAllDays(e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-violet-600 focus:ring-violet-500"
          />
          Apply to all days
        </label>
        <button
          type="button"
          onClick={handleSubmit}
          className="mt-3 w-full rounded-lg bg-violet-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
        >
          {applyToAllDays ? "Apply to all" : "Apply"}
        </button>
      </div>
    ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((current) => !current)}
        className={cn(
          "flex h-9 shrink-0 items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 px-2 text-xs font-medium text-stone-600 transition-colors",
          disabled
            ? "cursor-not-allowed opacity-50"
            : "hover:border-violet-200 hover:bg-violet-50/40 hover:text-violet-700",
          open && !disabled && "border-violet-300 bg-violet-50 text-violet-700 ring-2 ring-violet-100"
        )}
      >
        <Clock className="h-3.5 w-3.5 shrink-0 text-violet-500" />
        <span className="whitespace-nowrap">Custom Time</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-stone-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {typeof document !== "undefined" && menu
        ? createPortal(menu, document.body)
        : null}
    </>
  );
}

function IndianTimeSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState<"AM" | "PM">(() => time24To12(value).period);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, width: 208 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setPeriod(time24To12(value).period);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      setMenuStyle({
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(208, rect.width),
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const filteredSlots = useMemo(
    () => slotsForPeriod(period, value),
    [period, value]
  );

  const menu =
    open && !disabled ? (
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          top: menuStyle.top,
          left: menuStyle.left,
          width: menuStyle.width,
          zIndex: 9999,
        }}
        className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg"
      >
        <div className="flex gap-1 border-b border-stone-100 bg-stone-50 p-1.5">
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
        <div className="max-h-52 overflow-y-auto p-1">
          {filteredSlots.map((slot) => {
            const selected = slot === value;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => {
                  onChange(slot);
                  setOpen(false);
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
      </div>
    ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((current) => !current)}
        className={cn(
          "flex h-9 w-[7.25rem] shrink-0 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-2 text-xs text-stone-700 transition-colors",
          disabled
            ? "cursor-not-allowed opacity-50"
            : "hover:border-violet-200 hover:bg-violet-50/40",
          open && !disabled && "border-violet-300 ring-2 ring-violet-100"
        )}
      >
        <Clock className="h-3.5 w-3.5 shrink-0 text-violet-500" />
        <span className="flex-1 truncate text-left font-medium">
          {formatIndianTimeDisplay(value)}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-stone-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {typeof document !== "undefined" && menu
        ? createPortal(menu, document.body)
        : null}
    </>
  );
}

function BusinessHoursRow({
  dayKey,
  hours,
  onHoursChange,
  onApplyToAllDays,
}: {
  dayKey: DayKey;
  hours: DayHours;
  onHoursChange: (hours: Partial<DayHours>) => void;
  onApplyToAllDays: (open: string, close: string) => void;
}) {
  const isOpen = !hours.closed;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 sm:px-5",
        !isOpen && "opacity-70"
      )}
    >
      <div className="flex shrink-0 items-center gap-2.5">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
            isOpen
              ? "bg-violet-100 text-violet-700"
              : "bg-stone-100 text-stone-400"
          )}
        >
          {DAY_INITIALS[dayKey]}
        </div>

        <div className="shrink-0">
          <p className="whitespace-nowrap text-sm font-semibold text-stone-900">
            {DAY_FULL_NAMES[dayKey]}
          </p>
          <p className="whitespace-nowrap text-xs text-stone-500">
            {isOpen ? "Open all day" : "Closed"}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={isOpen}
          aria-label={`${DAY_FULL_NAMES[dayKey]} open`}
          onClick={() => onHoursChange({ closed: !hours.closed })}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors",
            isOpen ? "bg-violet-600" : "bg-stone-200"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
              isOpen ? "left-[22px]" : "left-0.5"
            )}
          />
        </button>
        <span
          className={cn(
            "whitespace-nowrap text-sm font-medium",
            isOpen ? "text-emerald-600" : "text-stone-400"
          )}
        >
          {isOpen ? "Open" : "Closed"}
        </span>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <IndianTimeSelect
          value={hours.open}
          onChange={(open) => onHoursChange({ open })}
          disabled={!isOpen}
        />
        <span className="shrink-0 text-xs text-stone-400">to</span>
        <IndianTimeSelect
          value={hours.close}
          onChange={(close) => onHoursChange({ close })}
          disabled={!isOpen}
        />
        <CustomTimeButton
          openTime={hours.open}
          closeTime={hours.close}
          onApply={(open, close) => onHoursChange({ open, close })}
          onApplyToAllDays={onApplyToAllDays}
          disabled={!isOpen}
        />
      </div>
    </div>
  );
}

export function BusinessHoursSection({
  openingHours,
  onHoursChange,
}: {
  openingHours: OpeningHours;
  onHoursChange: (day: DayKey, hours: Partial<DayHours>) => void;
}) {
  function applyTimesToAllDays(open: string, close: string) {
    for (const day of DAYS_OF_WEEK) {
      onHoursChange(day.key, { open, close, closed: false });
    }
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 px-4 py-4 sm:px-5">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-900">
              Business Hours
            </h3>
            <p className="mt-0.5 max-w-md text-sm text-stone-500">
              Set your weekly business hours and let your customers know when
              you&apos;re open.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-600">
          <Clock className="h-3.5 w-3.5 text-violet-500" />
          Local Time (Your timezone)
        </div>
      </div>

      <div className="divide-y divide-stone-100">
        {DAYS_OF_WEEK.map((day) => (
          <BusinessHoursRow
            key={day.key}
            dayKey={day.key}
            hours={openingHours[day.key]}
            onHoursChange={(hours) => onHoursChange(day.key, hours)}
            onApplyToAllDays={applyTimesToAllDays}
          />
        ))}
      </div>

      <div className="flex items-start gap-2 border-t border-emerald-100 bg-emerald-50 px-4 py-3 sm:px-5">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <p className="text-sm text-emerald-800">
          Business hours will be displayed to your customers in your local time
          zone.
        </p>
      </div>
    </div>
  );
}
