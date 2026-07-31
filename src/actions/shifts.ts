"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { shiftSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import {
  calculateShiftHours,
  getWeekStart,
  getWeekDays,
  toDateKey,
} from "@/lib/team";
import { addDays } from "date-fns";

function revalidateShifts() {
  revalidatePath("/team/shifts");
}

function normalizeDate(dateStr: string): Date {
  const d = new Date(dateStr + "T00:00:00");
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getShiftsForWeek(weekStartStr: string) {
  const session = await requireSession();
  const weekStart = getWeekStart(weekStartStr);
  const weekEnd = addDays(weekStart, 7);

  const [employees, shifts] = await Promise.all([
    prisma.employee.findMany({
      where: { salonId: session.user.salonId, status: "active" },
      orderBy: { name: "asc" },
    }),
    prisma.shift.findMany({
      where: {
        salonId: session.user.salonId,
        date: { gte: weekStart, lt: weekEnd },
      },
      include: { employee: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
  ]);

  return { employees, shifts, weekStart };
}

export async function getEmployeeWeeklyHours(
  employeeId: string,
  weekStartStr: string
): Promise<number> {
  const session = await requireSession();
  const weekStart = getWeekStart(weekStartStr);
  const weekEnd = addDays(weekStart, 7);

  const shifts = await prisma.shift.findMany({
    where: {
      salonId: session.user.salonId,
      employeeId,
      date: { gte: weekStart, lt: weekEnd },
      isWorking: true,
      startTime: { not: null },
      endTime: { not: null },
    },
  });

  return shifts.reduce((total, shift) => {
    if (!shift.startTime || !shift.endTime) return total;
    return total + calculateShiftHours(shift.startTime, shift.endTime);
  }, 0);
}

export async function createShift(formData: FormData) {
  const session = await requireSession();

  const raw = {
    employeeId: formData.get("employeeId") as string,
    date: formData.get("date") as string,
    startTime: (formData.get("startTime") as string) || undefined,
    endTime: (formData.get("endTime") as string) || undefined,
    isWorking: formData.get("isWorking") === "true",
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = shiftSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const employee = await prisma.employee.findFirst({
    where: { id: parsed.data.employeeId, salonId: session.user.salonId },
  });
  if (!employee) return { error: "Employee not found" };

  const date = normalizeDate(parsed.data.date);

  await prisma.shift.upsert({
    where: {
      employeeId_date: {
        employeeId: parsed.data.employeeId,
        date,
      },
    },
    create: {
      salonId: session.user.salonId,
      employeeId: parsed.data.employeeId,
      date,
      startTime: parsed.data.isWorking ? parsed.data.startTime : null,
      endTime: parsed.data.isWorking ? parsed.data.endTime : null,
      isWorking: parsed.data.isWorking,
      notes: parsed.data.notes,
    },
    update: {
      startTime: parsed.data.isWorking ? parsed.data.startTime : null,
      endTime: parsed.data.isWorking ? parsed.data.endTime : null,
      isWorking: parsed.data.isWorking,
      notes: parsed.data.notes,
    },
  });

  revalidateShifts();
  return { success: true };
}

export async function updateShift(id: string, formData: FormData) {
  const session = await requireSession();

  const raw = {
    employeeId: formData.get("employeeId") as string,
    date: formData.get("date") as string,
    startTime: (formData.get("startTime") as string) || undefined,
    endTime: (formData.get("endTime") as string) || undefined,
    isWorking: formData.get("isWorking") === "true",
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = shiftSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const shift = await prisma.shift.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!shift) return { error: "Shift not found" };

  await prisma.shift.update({
    where: { id },
    data: {
      date: normalizeDate(parsed.data.date),
      startTime: parsed.data.isWorking ? parsed.data.startTime : null,
      endTime: parsed.data.isWorking ? parsed.data.endTime : null,
      isWorking: parsed.data.isWorking,
      notes: parsed.data.notes,
    },
  });

  revalidateShifts();
  return { success: true };
}

export async function deleteShift(id: string) {
  const session = await requireSession();
  const shift = await prisma.shift.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!shift) return { error: "Shift not found" };

  await prisma.shift.delete({ where: { id } });
  revalidateShifts();
  return { success: true };
}

export type WeekShiftGrid = {
  weekStart: string;
  weekDays: string[];
  dailyTotals: number[];
  rows: {
    employee: { id: string; name: string; avatarUrl: string | null };
    weeklyHours: number;
    cells: {
      date: string;
      shift: {
        id: string;
        startTime: string | null;
        endTime: string | null;
        isWorking: boolean;
      } | null;
    }[];
  }[];
};

export async function getWeekShiftGrid(weekStartStr: string): Promise<WeekShiftGrid> {
  const { employees, shifts, weekStart } = await getShiftsForWeek(weekStartStr);
  const weekDays = getWeekDays(weekStart);
  const dayKeys = weekDays.map(toDateKey);

  const shiftMap = new Map<string, (typeof shifts)[0]>();
  for (const shift of shifts) {
    shiftMap.set(`${shift.employeeId}-${toDateKey(shift.date)}`, shift);
  }

  const dailyTotals = dayKeys.map(() => 0);

  const rows = employees.map((employee) => {
    let weeklyHours = 0;
    const cells = dayKeys.map((dateKey, dayIndex) => {
      const shift = shiftMap.get(`${employee.id}-${dateKey}`) ?? null;
      if (shift?.isWorking && shift.startTime && shift.endTime) {
        const hours = calculateShiftHours(shift.startTime, shift.endTime);
        weeklyHours += hours;
        dailyTotals[dayIndex] += hours;
      }
      return {
        date: dateKey,
        shift: shift
          ? {
              id: shift.id,
              startTime: shift.startTime,
              endTime: shift.endTime,
              isWorking: shift.isWorking,
            }
          : null,
      };
    });
    return {
      employee: {
        id: employee.id,
        name: employee.name,
        avatarUrl: employee.avatarUrl,
      },
      weeklyHours,
      cells,
    };
  });

  return {
    weekStart: toDateKey(weekStart),
    weekDays: dayKeys,
    dailyTotals,
    rows,
  };
}
