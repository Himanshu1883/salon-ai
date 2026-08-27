import type { AttendanceRecord } from "@/generated/prisma/client";
import type { AttendanceRecordView, AttendanceStatus } from "./types";
import {
  computeEarlyCheckoutMinutes,
  computeLateMinutes,
  computeWorkedMinutes,
  deriveRecordStatus,
} from "./compute";
import { formatZonedTime, getBusinessDateKey } from "./business-day";

type ShiftLike = {
  startTime: string | null;
  endTime: string | null;
};

export function mapAttendanceRecord(
  record: AttendanceRecord & { employee: { id: string; name: string } },
  shift?: ShiftLike | null,
  now: Date = new Date()
): AttendanceRecordView {
  const todayKey = getBusinessDateKey(now);
  const recordKey = getBusinessDateKey(record.date);
  const isPastBusinessDay = recordKey < todayKey;

  const lateMinutes =
    record.lateMinutes ??
    computeLateMinutes(record.checkInAt, shift?.startTime ?? null);
  const earlyCheckoutMinutes =
    record.earlyCheckoutMinutes ??
    (record.checkOutAt
      ? computeEarlyCheckoutMinutes(record.checkOutAt, shift?.endTime ?? null)
      : 0);

  const status = (record.status as AttendanceStatus) || deriveRecordStatus({
    checkOutAt: record.checkOutAt,
    lateMinutes,
    correctedAt: record.correctedAt,
    isPastBusinessDay,
  });

  const totalWorkedMinutes =
    record.totalWorkedMinutes ??
    computeWorkedMinutes(record.checkInAt, record.checkOutAt, now);

  return {
    id: record.id,
    employeeId: record.employeeId,
    employeeName: record.employee.name,
    date: recordKey,
    checkInAt: record.checkInAt.toISOString(),
    checkOutAt: record.checkOutAt?.toISOString() ?? null,
    status,
    method: record.method,
    totalWorkedMinutes,
    lateMinutes,
    earlyCheckoutMinutes,
    notes: record.notes,
    confidence: record.confidence,
  };
}

export function formatRecordTime(iso: string | null): string {
  if (!iso) return "—";
  return formatZonedTime(new Date(iso));
}
