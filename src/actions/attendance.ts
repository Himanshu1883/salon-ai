"use server";

import { prisma } from "@/lib/prisma";
import { requireSession, requireOwnerOrManager } from "@/lib/auth";
import {
  findBestFaceMatch,
  parseDescriptorJson,
  FACE_MATCH_THRESHOLD,
} from "@/lib/face-match";
import { revalidatePath } from "next/cache";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  parseISO,
} from "date-fns";

const ATTENDANCE_PATHS = [
  "/team/attendance",
  "/team/attendance/enroll",
  "/team/attendance/log",
  "/team/attendance/reports",
  "/team/members",
];

function revalidateAttendance() {
  for (const path of ATTENDANCE_PATHS) {
    revalidatePath(path);
  }
}

function todayDate(): Date {
  return startOfDay(new Date());
}

function parseAttendanceDate(dateStr: string): Date {
  return startOfDay(parseISO(dateStr));
}

async function getEmployeeForSalon(employeeId: string, salonId: string) {
  return prisma.employee.findFirst({
    where: { id: employeeId, salonId, status: "active" },
  });
}

export async function getFaceProfiles() {
  const session = await requireSession();
  const profiles = await prisma.employeeFaceProfile.findMany({
    where: { salonId: session.user.salonId },
    include: {
      employee: { select: { id: true, name: true, status: true } },
    },
  });

  return profiles
    .filter((p) => p.employee.status === "active")
    .map((p) => ({
      employeeId: p.employeeId,
      employeeName: p.employee.name,
      faceDescriptor: parseDescriptorJson(p.faceDescriptor),
      enrolledAt: p.enrolledAt.toISOString(),
    }));
}

export async function getEmployeeFaceStatus(employeeId: string) {
  const session = await requireSession();
  const profile = await prisma.employeeFaceProfile.findFirst({
    where: { employeeId, salonId: session.user.salonId },
    select: { id: true, enrolledAt: true },
  });
  return profile
    ? { enrolled: true, enrolledAt: profile.enrolledAt.toISOString() }
    : { enrolled: false, enrolledAt: null };
}

export async function enrollFace(employeeId: string, descriptorJson: string) {
  const session = await requireSession();

  try {
    const descriptor = parseDescriptorJson(descriptorJson);
    if (descriptor.length !== 128) {
      return { error: "Invalid face descriptor" };
    }
  } catch {
    return { error: "Invalid face descriptor format" };
  }

  const employee = await getEmployeeForSalon(employeeId, session.user.salonId);
  if (!employee) return { error: "Team member not found" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const isOwnerOrManager =
    user?.role === "owner" || user?.role === "manager";

  if (!isOwnerOrManager) {
    return { error: "Only owners and managers can enroll faces" };
  }

  await prisma.employeeFaceProfile.upsert({
    where: { employeeId },
    create: {
      salonId: session.user.salonId,
      employeeId,
      faceDescriptor: descriptorJson,
      enrolledByUserId: session.user.id,
    },
    update: {
      faceDescriptor: descriptorJson,
      enrolledByUserId: session.user.id,
    },
  });

  revalidateAttendance();
  revalidatePath(`/team/members/${employeeId}`);
  return { success: true };
}

export async function matchFaceDescriptor(descriptorJson: string) {
  const session = await requireSession();

  let descriptor: number[];
  try {
    descriptor = parseDescriptorJson(descriptorJson);
  } catch {
    return { error: "Invalid face descriptor" };
  }

  const profiles = await prisma.employeeFaceProfile.findMany({
    where: { salonId: session.user.salonId },
    include: { employee: { select: { id: true, name: true, status: true } } },
  });

  const activeProfiles = profiles
    .filter((p) => p.employee.status === "active")
    .map((p) => ({
      employeeId: p.employeeId,
      employeeName: p.employee.name,
      faceDescriptor: parseDescriptorJson(p.faceDescriptor),
    }));

  const match = findBestFaceMatch(descriptor, activeProfiles);
  if (!match) {
    return { error: "No matching team member found" };
  }

  return {
    success: true,
    employeeId: match.employeeId,
    employeeName: match.employeeName,
    confidence: match.confidence,
    distance: match.distance,
    threshold: FACE_MATCH_THRESHOLD,
  };
}

export async function recordCheckIn(
  employeeId: string,
  method: "face" | "manual" | "shift",
  confidence?: number
) {
  const session = await requireSession();
  const employee = await getEmployeeForSalon(employeeId, session.user.salonId);
  if (!employee) return { error: "Team member not found" };

  const date = todayDate();
  const now = new Date();

  const existing = await prisma.attendanceRecord.findUnique({
    where: { employeeId_date: { employeeId, date } },
  });

  if (existing) {
    if (!existing.checkOutAt) {
      return recordCheckOut(employeeId);
    }
    return {
      error: `${employee.name} has already completed attendance for today`,
    };
  }

  const record = await prisma.attendanceRecord.create({
    data: {
      salonId: session.user.salonId,
      employeeId,
      date,
      checkInAt: now,
      method,
      confidence: confidence ?? null,
    },
    include: { employee: { select: { name: true } } },
  });

  revalidateAttendance();
  return {
    success: true,
    action: "check_in" as const,
    employeeName: record.employee.name,
    time: format(now, "HH:mm"),
    recordId: record.id,
  };
}

export async function recordCheckOut(employeeId: string) {
  const session = await requireSession();
  const employee = await getEmployeeForSalon(employeeId, session.user.salonId);
  if (!employee) return { error: "Team member not found" };

  const date = todayDate();
  const now = new Date();

  const existing = await prisma.attendanceRecord.findUnique({
    where: { employeeId_date: { employeeId, date } },
  });

  if (!existing) {
    return { error: `${employee.name} has not checked in today` };
  }
  if (existing.checkOutAt) {
    return { error: `${employee.name} has already checked out today` };
  }

  await prisma.attendanceRecord.update({
    where: { id: existing.id },
    data: { checkOutAt: now },
  });

  revalidateAttendance();
  return {
    success: true,
    action: "check_out" as const,
    employeeName: employee.name,
    time: format(now, "HH:mm"),
  };
}

export async function getAttendanceLog(dateStr: string, employeeId?: string) {
  const session = await requireSession();
  const date = parseAttendanceDate(dateStr);

  const records = await prisma.attendanceRecord.findMany({
    where: {
      salonId: session.user.salonId,
      date,
      ...(employeeId ? { employeeId } : {}),
    },
    include: {
      employee: { select: { id: true, name: true } },
    },
    orderBy: { checkInAt: "asc" },
  });

  return records.map((r) => ({
    id: r.id,
    employeeId: r.employeeId,
    employeeName: r.employee.name,
    date: format(r.date, "yyyy-MM-dd"),
    checkInAt: r.checkInAt.toISOString(),
    checkOutAt: r.checkOutAt?.toISOString() ?? null,
    method: r.method,
    confidence: r.confidence,
    hours: computeHours(r.checkInAt, r.checkOutAt),
    notes: r.notes,
  }));
}

export async function getAttendanceLogCsv(
  dateStr: string,
  employeeId?: string
): Promise<string> {
  const rows = await getAttendanceLog(dateStr, employeeId);
  const header =
    "Date,Employee,Check-in,Check-out,Hours,Method,Confidence\n";
  const body = rows
    .map((r) => {
      const checkIn = format(new Date(r.checkInAt), "HH:mm");
      const checkOut = r.checkOutAt
        ? format(new Date(r.checkOutAt), "HH:mm")
        : "";
      return [
        r.date,
        `"${r.employeeName.replace(/"/g, '""')}"`,
        checkIn,
        checkOut,
        r.hours.toFixed(2),
        r.method,
        r.confidence?.toFixed(3) ?? "",
      ].join(",");
    })
    .join("\n");
  return header + body;
}

function computeHours(checkIn: Date, checkOut: Date | null): number {
  if (!checkOut) return 0;
  return Math.max(0, (checkOut.getTime() - checkIn.getTime()) / 3600000);
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + (minutes ?? 0);
}

export async function getMonthlyAttendanceReport(
  year: number,
  month: number,
  employeeId?: string
) {
  const session = await requireSession();
  const monthStart = startOfMonth(new Date(year, month - 1, 1));
  const monthEnd = endOfMonth(monthStart);

  const employees = await prisma.employee.findMany({
    where: {
      salonId: session.user.salonId,
      status: "active",
      ...(employeeId ? { id: employeeId } : {}),
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const records = await prisma.attendanceRecord.findMany({
    where: {
      salonId: session.user.salonId,
      date: { gte: monthStart, lte: monthEnd },
      ...(employeeId ? { employeeId } : {}),
    },
    orderBy: { date: "asc" },
  });

  const shifts = await prisma.shift.findMany({
    where: {
      salonId: session.user.salonId,
      date: { gte: monthStart, lte: monthEnd },
      isWorking: true,
      ...(employeeId ? { employeeId } : {}),
    },
  });

  const recordsByEmployee = new Map<string, typeof records>();
  for (const r of records) {
    const list = recordsByEmployee.get(r.employeeId) ?? [];
    list.push(r);
    recordsByEmployee.set(r.employeeId, list);
  }

  const shiftsByEmployee = new Map<string, typeof shifts>();
  for (const s of shifts) {
    const list = shiftsByEmployee.get(s.employeeId) ?? [];
    list.push(s);
    shiftsByEmployee.set(s.employeeId, list);
  }

  const summaries = employees.map((emp) => {
    const empRecords = recordsByEmployee.get(emp.id) ?? [];
    const empShifts = shiftsByEmployee.get(emp.id) ?? [];

    const daysPresent = empRecords.length;
    const totalHours = empRecords.reduce(
      (sum, r) => sum + computeHours(r.checkInAt, r.checkOutAt),
      0
    );

    const scheduledDays = empShifts.length;
    const absentDays = Math.max(0, scheduledDays - daysPresent);

    let lateArrivals = 0;
    const checkInMinutes: number[] = [];

    for (const record of empRecords) {
      const checkIn = new Date(record.checkInAt);
      checkInMinutes.push(checkIn.getHours() * 60 + checkIn.getMinutes());

      const dayShift = empShifts.find(
        (s) =>
          startOfDay(s.date).getTime() === startOfDay(record.date).getTime() &&
          s.startTime
      );
      if (dayShift?.startTime) {
        const shiftStart = parseTimeToMinutes(dayShift.startTime);
        const actualStart = checkIn.getHours() * 60 + checkIn.getMinutes();
        if (actualStart > shiftStart + 5) lateArrivals++;
      }
    }

    const avgCheckInMinutes =
      checkInMinutes.length > 0
        ? checkInMinutes.reduce((a, b) => a + b, 0) / checkInMinutes.length
        : null;

    const dailyBreakdown = empRecords.map((r) => ({
      date: format(r.date, "yyyy-MM-dd"),
      checkInAt: r.checkInAt.toISOString(),
      checkOutAt: r.checkOutAt?.toISOString() ?? null,
      hours: computeHours(r.checkInAt, r.checkOutAt),
      method: r.method,
      late:
        empShifts.find(
          (s) =>
            startOfDay(s.date).getTime() === startOfDay(r.date).getTime() &&
            s.startTime
        ) != null &&
        (() => {
          const shift = empShifts.find(
            (s) =>
              startOfDay(s.date).getTime() === startOfDay(r.date).getTime() &&
              s.startTime
          );
          if (!shift?.startTime) return false;
          const checkIn = new Date(r.checkInAt);
          return (
            checkIn.getHours() * 60 + checkIn.getMinutes() >
            parseTimeToMinutes(shift.startTime) + 5
          );
        })(),
    }));

    return {
      employeeId: emp.id,
      employeeName: emp.name,
      daysPresent,
      scheduledDays,
      absentDays,
      totalHours: Math.round(totalHours * 100) / 100,
      lateArrivals,
      avgCheckInTime: avgCheckInMinutes
        ? formatMinutesAsTime(avgCheckInMinutes)
        : null,
      dailyBreakdown,
    };
  });

  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return {
    year,
    month,
    monthLabel: format(monthStart, "MMMM yyyy"),
    daysInMonth: allDays.length,
    summaries,
  };
}

function formatMinutesAsTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export async function getActiveEmployeesForAttendance() {
  const session = await requireSession();
  return prisma.employee.findMany({
    where: { salonId: session.user.salonId, status: "active" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function canEnrollFaces() {
  try {
    await requireOwnerOrManager();
    return { allowed: true };
  } catch {
    return { allowed: false };
  }
}

export async function getTodayAttendanceStatus(employeeId: string) {
  const session = await requireSession();
  const date = todayDate();
  const record = await prisma.attendanceRecord.findUnique({
    where: { employeeId_date: { employeeId, date } },
  });
  if (!record) return { status: "none" as const };
  if (!record.checkOutAt) return { status: "checked_in" as const };
  return { status: "completed" as const };
}
