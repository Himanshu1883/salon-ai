"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { cachedBySalon, scheduleSalonCacheRevalidation } from "@/lib/salon-cache";
import { seatsConfigSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

const getCachedSeatOptions = cachedBySalon(
  "team",
  async (salonId: string) =>
    prisma.seat.findMany({
      where: { salonId },
      select: { id: true, number: true },
      orderBy: { number: "asc" },
    }),
  { revalidate: 60, key: "seat-options" }
);

export async function getSeatOptions() {
  const session = await requireSession();
  return getCachedSeatOptions(session.user.salonId!);
}

export async function getSeats() {
  const session = await requireSession();
  return prisma.seat.findMany({
    where: { salonId: session.user.salonId },
    include: { employee: true },
    orderBy: { number: "asc" },
  });
}

export async function getSalonConfig() {
  const session = await requireSession();
  return prisma.salon.findUnique({
    where: { id: session.user.salonId },
    select: { totalSeats: true, name: true },
  });
}

export async function updateSeatsConfig(formData: FormData) {
  const session = await requireSession();
  const raw = { totalSeats: formData.get("totalSeats") as string };
  const parsed = seatsConfigSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const currentSeats = await prisma.seat.findMany({
    where: { salonId: session.user.salonId },
    orderBy: { number: "asc" },
  });

  const newTotal = parsed.data.totalSeats;
  const currentTotal = currentSeats.length;

  if (newTotal > currentTotal) {
    await prisma.seat.createMany({
      data: Array.from({ length: newTotal - currentTotal }, (_, i) => ({
        salonId: session.user.salonId,
        number: currentTotal + i + 1,
        status: "available",
      })),
    });
  } else if (newTotal < currentTotal) {
    const seatsToRemove = currentSeats
      .filter((s) => s.number > newTotal && s.status === "available")
      .map((s) => s.id);

    if (seatsToRemove.length < currentTotal - newTotal) {
      return {
        error: "Cannot reduce seats while some are occupied or reserved",
      };
    }

    await prisma.seat.deleteMany({
      where: { id: { in: seatsToRemove } },
    });
  }

  await prisma.salon.update({
    where: { id: session.user.salonId },
    data: { totalSeats: newTotal },
  });

  scheduleSalonCacheRevalidation(session.user.salonId!, "team");
  revalidatePath("/seats");
  revalidatePath("/dashboard");
  revalidatePath("/billing");
  return { success: true };
}

export async function updateSeatStatus(
  seatId: string,
  status: string,
  employeeId?: string | null
) {
  const session = await requireSession();
  const seat = await prisma.seat.findFirst({
    where: { id: seatId, salonId: session.user.salonId },
  });
  if (!seat) return { error: "Seat not found" };

  await prisma.seat.update({
    where: { id: seatId },
    data: {
      status,
      employeeId: employeeId ?? null,
    },
  });

  revalidatePath("/seats");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getAvailableSeats() {
  const session = await requireSession();
  return prisma.seat.findMany({
    where: { salonId: session.user.salonId, status: "available" },
    orderBy: { number: "asc" },
  });
}
