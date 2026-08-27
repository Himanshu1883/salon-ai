import { endOfMonth, startOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import {
  businessDateFromKey,
  getBusinessDateKey,
} from "@/lib/attendance/business-day";
import {
  computeEarlyCheckoutMinutes,
  computeLateMinutes,
  computeWorkedMinutes,
  deriveRecordStatus,
} from "@/lib/attendance/compute";
import type { MyAttendanceToday } from "@/lib/attendance/types";
import { mapAttendanceRecord } from "@/lib/attendance/presenter";
import { isPrismaClientValidationError } from "@/lib/attendance/legacy-write";

async function getShiftForEmployeeDate(
  salonId: string,
  employeeId: string,
  dateKey: string
) {
  const date = businessDateFromKey(dateKey);
  return prisma.shift.findUnique({
    where: { employeeId_date: { employeeId, date } },
    select: { startTime: true, endTime: true, isWorking: true },
  });
}

async function writeAuditLog(input: {
  salonId: string;
  attendanceId: string;
  changedByUserId: string;
  action: string;
  previousCheckInAt?: Date | null;
  previousCheckOutAt?: Date | null;
  newCheckInAt?: Date | null;
  newCheckOutAt?: Date | null;
  reason?: string | null;
}) {
  try {
    await prisma.attendanceAuditLog.create({
      data: {
        salonId: input.salonId,
        attendanceId: input.attendanceId,
        changedByUserId: input.changedByUserId,
        action: input.action,
        previousCheckInAt: input.previousCheckInAt ?? null,
        previousCheckOutAt: input.previousCheckOutAt ?? null,
        newCheckInAt: input.newCheckInAt ?? null,
        newCheckOutAt: input.newCheckOutAt ?? null,
        reason: input.reason ?? null,
      },
    });
  } catch {
    // Audit log is best-effort; check-in/out must still succeed.
  }
}

export async function performCheckIn(input: {
  salonId: string;
  employeeId: string;
  userId: string;
  method: "face" | "manual" | "shift" | "self";
  confidence?: number;
}) {
  const employee = await prisma.employee.findFirst({
    where: { id: input.employeeId, salonId: input.salonId, status: "active" },
    select: { id: true, name: true },
  });
  if (!employee) return { error: "Team member not found" as const };

  const dateKey = getBusinessDateKey();
  const date = businessDateFromKey(dateKey);
  const now = new Date();

  const existing = await prisma.attendanceRecord.findUnique({
    where: { employeeId_date: { employeeId: input.employeeId, date } },
  });

  if (existing) {
    if (!existing.checkOutAt) {
      const checkInTime = new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(existing.checkInAt);
      return {
        error: `Already checked in at ${checkInTime}`,
        alreadyCheckedIn: true as const,
        checkInAt: existing.checkInAt.toISOString(),
      };
    }
    return {
      error: `${employee.name} has already completed attendance for today`,
    };
  }

  const shift = await getShiftForEmployeeDate(
    input.salonId,
    input.employeeId,
    dateKey
  );
  const lateMinutes = computeLateMinutes(now, shift?.startTime);

  let record: Awaited<ReturnType<typeof prisma.attendanceRecord.create>>;
  try {
    record = await prisma.attendanceRecord.create({
      data: {
        salonId: input.salonId,
        employeeId: input.employeeId,
        date,
        checkInAt: now,
        method: input.method,
        confidence: input.confidence ?? null,
        status: lateMinutes > 0 ? "LATE" : "WORKING",
        lateMinutes,
        createdByUserId: input.userId,
      },
      include: { employee: { select: { id: true, name: true } } },
    });
  } catch (error) {
    if (!isPrismaClientValidationError(error)) throw error;
    record = await prisma.attendanceRecord.create({
      data: {
        salonId: input.salonId,
        employeeId: input.employeeId,
        date,
        checkInAt: now,
        method: input.method,
        confidence: input.confidence ?? null,
      },
      include: { employee: { select: { id: true, name: true } } },
    });
  }

  await writeAuditLog({
    salonId: input.salonId,
    attendanceId: record.id,
    changedByUserId: input.userId,
    action: "check_in",
    newCheckInAt: now,
  });

  return {
    success: true as const,
    action: "check_in" as const,
    employeeName: record.employee.name,
    time: new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(now),
    recordId: record.id,
    lateMinutes,
  };
}

export async function performCheckOut(input: {
  salonId: string;
  employeeId: string;
  userId: string;
}) {
  const employee = await prisma.employee.findFirst({
    where: { id: input.employeeId, salonId: input.salonId, status: "active" },
    select: { name: true },
  });
  if (!employee) return { error: "Team member not found" as const };

  const dateKey = getBusinessDateKey();
  const date = businessDateFromKey(dateKey);
  const now = new Date();

  const existing = await prisma.attendanceRecord.findUnique({
    where: { employeeId_date: { employeeId: input.employeeId, date } },
  });

  if (!existing) {
    return { error: `${employee.name} has not checked in today` };
  }
  if (existing.checkOutAt) {
    return { error: `${employee.name} has already checked out today` };
  }

  const shift = await getShiftForEmployeeDate(
    input.salonId,
    input.employeeId,
    dateKey
  );
  const totalWorkedMinutes = computeWorkedMinutes(existing.checkInAt, now);
  const earlyCheckoutMinutes = computeEarlyCheckoutMinutes(
    now,
    shift?.endTime
  );
  const lateMinutes =
    existing.lateMinutes ??
    computeLateMinutes(existing.checkInAt, shift?.startTime);
  const status = deriveRecordStatus({
    checkOutAt: now,
    lateMinutes,
    correctedAt: existing.correctedAt,
    isPastBusinessDay: false,
  });

  try {
    await prisma.attendanceRecord.update({
      where: { id: existing.id },
      data: {
        checkOutAt: now,
        totalWorkedMinutes,
        earlyCheckoutMinutes,
        lateMinutes,
        status: lateMinutes > 0 ? "LATE" : status,
      },
    });
  } catch (error) {
    if (!isPrismaClientValidationError(error)) throw error;
    await prisma.attendanceRecord.update({
      where: { id: existing.id },
      data: { checkOutAt: now },
    });
  }

  await writeAuditLog({
    salonId: input.salonId,
    attendanceId: existing.id,
    changedByUserId: input.userId,
    action: "check_out",
    previousCheckInAt: existing.checkInAt,
    newCheckInAt: existing.checkInAt,
    newCheckOutAt: now,
  });

  return {
    success: true as const,
    action: "check_out" as const,
    employeeName: employee.name,
    time: new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(now),
    workedMinutes: totalWorkedMinutes,
  };
}

export async function getMyAttendanceToday(input: {
  salonId: string;
  employeeId: string;
  employeeName: string;
}): Promise<MyAttendanceToday> {
  const dateKey = getBusinessDateKey();
  const date = businessDateFromKey(dateKey);
  const now = new Date();

  const record = await prisma.attendanceRecord.findUnique({
    where: { employeeId_date: { employeeId: input.employeeId, date } },
    include: { employee: { select: { id: true, name: true } } },
  });

  if (!record) {
    return {
      employeeId: input.employeeId,
      employeeName: input.employeeName,
      status: "none",
      checkInAt: null,
      checkOutAt: null,
      workedMinutes: 0,
      lateMinutes: 0,
      canCheckIn: true,
      canCheckOut: false,
    };
  }

  const shift = await getShiftForEmployeeDate(
    input.salonId,
    input.employeeId,
    dateKey
  );
  const mapped = mapAttendanceRecord(record, shift, now);
  const working = !record.checkOutAt;

  return {
    employeeId: input.employeeId,
    employeeName: input.employeeName,
    status: working ? "working" : "completed",
    checkInAt: mapped.checkInAt,
    checkOutAt: mapped.checkOutAt,
    workedMinutes: mapped.totalWorkedMinutes,
    lateMinutes: mapped.lateMinutes,
    canCheckIn: false,
    canCheckOut: working,
    message: working
      ? undefined
      : "You have completed attendance for today",
  };
}

export async function getDailyAttendanceDashboard(
  salonId: string,
  dateKey: string
) {
  const date = businessDateFromKey(dateKey);

  const [employees, records, shifts] = await Promise.all([
    prisma.employee.findMany({
      where: { salonId, status: "active" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.attendanceRecord.findMany({
      where: { salonId, date },
      include: { employee: { select: { id: true, name: true } } },
      orderBy: { checkInAt: "asc" },
    }),
    prisma.shift.findMany({
      where: { salonId, date, isWorking: true },
      select: { employeeId: true, startTime: true, endTime: true },
    }),
  ]);

  const shiftByEmployee = new Map(shifts.map((s) => [s.employeeId, s]));
  const recordByEmployee = new Map(records.map((r) => [r.employeeId, r]));
  const now = new Date();
  const isToday = dateKey === getBusinessDateKey(now);

  const rows = employees.map((emp) => {
    const record = recordByEmployee.get(emp.id);
    const shift = shiftByEmployee.get(emp.id);
    if (!record) {
      return {
        employeeId: emp.id,
        employeeName: emp.name,
        status: "ABSENT" as const,
        checkInAt: null,
        checkOutAt: null,
        workedMinutes: 0,
        lateMinutes: 0,
        recordId: null,
      };
    }
    const mapped = mapAttendanceRecord(
      record,
      shift,
      now
    );
    let status = mapped.status;
    if (!record.checkOutAt && !isToday) status = "MISSED_CHECKOUT";
    return {
      employeeId: emp.id,
      employeeName: emp.name,
      status,
      checkInAt: mapped.checkInAt,
      checkOutAt: mapped.checkOutAt,
      workedMinutes: mapped.totalWorkedMinutes,
      lateMinutes: mapped.lateMinutes,
      recordId: mapped.id,
    };
  });

  const present = rows.filter((r) => r.status !== "ABSENT").length;
  const working = rows.filter(
    (r) => r.status === "WORKING" || r.status === "LATE"
  ).length;
  const completed = rows.filter(
    (r) => r.status === "COMPLETED" || r.status === "CORRECTED"
  ).length;
  const late = rows.filter((r) => r.lateMinutes > 0).length;
  const missedCheckout = rows.filter(
    (r) => r.status === "MISSED_CHECKOUT"
  ).length;

  return {
    date: dateKey,
    summary: {
      totalEmployees: employees.length,
      present,
      working,
      completed,
      absent: employees.length - present,
      late,
      missedCheckout,
    },
    rows,
  };
}

export async function getMyAttendanceMonthStats(input: {
  salonId: string;
  employeeId: string;
}) {
  const dateKey = getBusinessDateKey();
  const today = businessDateFromKey(dateKey);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const records = await prisma.attendanceRecord.findMany({
    where: {
      salonId: input.salonId,
      employeeId: input.employeeId,
      date: { gte: monthStart, lte: monthEnd },
    },
    select: { checkInAt: true, date: true, lateMinutes: true, status: true },
  }).catch(async () => {
    return prisma.attendanceRecord.findMany({
      where: {
        salonId: input.salonId,
        employeeId: input.employeeId,
        date: { gte: monthStart, lte: monthEnd },
      },
      select: { checkInAt: true, date: true },
    });
  });

  const shifts = await prisma.shift.findMany({
    where: {
      salonId: input.salonId,
      employeeId: input.employeeId,
      date: { gte: monthStart, lte: monthEnd },
      isWorking: true,
    },
    select: { date: true, startTime: true },
  });
  const shiftByDate = new Map(
    shifts.map((s) => [getBusinessDateKey(s.date), s.startTime])
  );

  let lateDays = 0;
  let leaveDays = 0;
  for (const record of records) {
    const storedLate =
      "lateMinutes" in record && record.lateMinutes != null
        ? record.lateMinutes
        : null;
    const dateKey = getBusinessDateKey(record.date);
    const late =
      storedLate ??
      computeLateMinutes(record.checkInAt, shiftByDate.get(dateKey));
    if (late > 0) lateDays += 1;
    if ("status" in record && record.status === "ON_LEAVE") leaveDays += 1;
  }

  return {
    monthKey: formatMonthKey(today),
    lateDays,
    leaveDays,
  };
}

function formatMonthKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
  })
    .format(date)
    .slice(0, 7);
}
