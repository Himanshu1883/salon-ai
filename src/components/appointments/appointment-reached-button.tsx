"use client";

import { useState } from "react";
import { UserCheck } from "lucide-react";
import { checkInFromAppointment } from "@/actions/queue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isAppointmentToday } from "./appointments-utils";
import type { Appointment } from "./types";

type AppointmentReachedButtonProps = {
  appointment: Pick<Appointment, "id" | "status" | "scheduledAt">;
  onSuccess?: () => void;
  variant?: "button" | "badge" | "compact";
  className?: string;
};

export function AppointmentReachedButton({
  appointment,
  onSuccess,
  variant = "button",
  className,
}: AppointmentReachedButtonProps) {
  const [loading, setLoading] = useState(false);

  if (appointment.status === "checked_in") {
    if (variant === "badge" || variant === "compact") {
      return (
        <Badge
          className={cn(
            "border-0 bg-[#FEF3C7] text-[#92400E] hover:bg-[#FEF3C7]",
            className
          )}
        >
          In Queue
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className={cn(
          "border-[#FCD34D] bg-[#FEF3C7] text-[#92400E]",
          className
        )}
      >
        In Queue
      </Badge>
    );
  }

  if (
    appointment.status !== "scheduled" ||
    !isAppointmentToday(appointment as Appointment)
  ) {
    return null;
  }

  async function handleReached() {
    setLoading(true);
    const result = await checkInFromAppointment(appointment.id);
    setLoading(false);

    if (result.error) {
      alert(result.error);
      return;
    }

    onSuccess?.();
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        disabled={loading}
        onClick={(e) => {
          e.stopPropagation();
          handleReached();
        }}
        className={cn(
          "rounded-md bg-white/80 px-1.5 py-0.5 text-[9px] font-semibold text-[#6C3BFF] transition-colors hover:bg-white",
          className
        )}
        title="Mark customer as reached"
      >
        {loading ? "…" : "Reached"}
      </button>
    );
  }

  return (
    <Button
      size="sm"
      disabled={loading}
      onClick={handleReached}
      className={cn(
        "rounded-xl bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] text-white shadow-sm hover:from-[#5B2FE6] hover:to-[#7C3AED]",
        className
      )}
    >
      <UserCheck className="h-4 w-4" />
      {loading ? "Adding…" : "Customer Reached"}
    </Button>
  );
}
