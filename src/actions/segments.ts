"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { customSegmentSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import {
  STANDARD_SEGMENTS,
  customerMatchesSegment,
  getStandardSegmentById,
  isStandardSegmentId,
  type SegmentDataContext,
  type StandardSegmentId,
} from "@/lib/segments";

async function loadSegmentContext(salonId: string): Promise<SegmentDataContext> {
  const [customers, paidInvoices, checkIns, appointments] = await Promise.all([
    prisma.customer.findMany({
      where: { salonId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        notes: true,
        birthday: true,
        createdAt: true,
      },
    }),
    prisma.invoice.findMany({
      where: { salonId, status: "paid" },
      select: {
        customerId: true,
        customerPhone: true,
        customerName: true,
        total: true,
        paidAt: true,
        createdAt: true,
      },
    }),
    prisma.queueEntry.findMany({
      where: { salonId },
      select: {
        customerId: true,
        status: true,
        checkedInAt: true,
        completedAt: true,
      },
    }),
    prisma.appointment.findMany({
      where: { salonId },
      select: {
        customerId: true,
        status: true,
        scheduledAt: true,
      },
    }),
  ]);

  return { customers, paidInvoices, checkIns, appointments };
}

export type SegmentListItem = {
  id: string;
  name: string;
  description: string;
  iconKey: string;
  clientCount: number;
  type: "standard" | "custom";
};

export async function getStandardSegments(salonId?: string) {
  const session = await requireSession();
  const resolvedSalonId = salonId ?? session.user.salonId;
  const ctx = await loadSegmentContext(resolvedSalonId);

  return STANDARD_SEGMENTS.map((segment) => ({
    id: segment.id,
    name: segment.name,
    description: segment.description,
    iconKey: segment.iconKey,
    clientCount: ctx.customers.filter((c) =>
      customerMatchesSegment(segment.id, c, ctx)
    ).length,
    type: "standard" as const,
  }));
}

export async function getCustomSegments(salonId?: string) {
  const session = await requireSession();
  const resolvedSalonId = salonId ?? session.user.salonId;

  const segments = await prisma.customSegment.findMany({
    where: { salonId: resolvedSalonId },
    orderBy: { createdAt: "desc" },
  });

  return segments.map((segment) => ({
    id: segment.id,
    name: segment.name,
    description: segment.description ?? "",
    iconKey: "sparkles",
    clientCount: 0,
    type: "custom" as const,
  }));
}

export async function getAllSegments() {
  const [standard, custom] = await Promise.all([
    getStandardSegments(),
    getCustomSegments(),
  ]);
  return { standard, custom, totalCount: standard.length + custom.length };
}

export async function searchSegments(query: string) {
  const { standard, custom } = await getAllSegments();
  const q = query.trim().toLowerCase();
  if (!q) return { standard, custom };

  return {
    standard: standard.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    ),
    custom: custom.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    ),
  };
}

export async function getSegmentCustomers(segmentId: string) {
  const session = await requireSession();
  const salonId = session.user.salonId;

  if (isStandardSegmentId(segmentId)) {
    const ctx = await loadSegmentContext(salonId);
    const matching = ctx.customers.filter((c) =>
      customerMatchesSegment(segmentId, c, ctx)
    );

    return matching.map((customer) => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      createdAt: customer.createdAt,
    }));
  }

  const custom = await prisma.customSegment.findFirst({
    where: { id: segmentId, salonId },
  });
  if (!custom) return null;

  return [];
}

export async function getSegmentDetail(segmentId: string) {
  const session = await requireSession();
  const salonId = session.user.salonId;

  if (isStandardSegmentId(segmentId)) {
    const segment = getStandardSegmentById(segmentId);
    if (!segment) return null;

    const ctx = await loadSegmentContext(salonId);
    const clientCount = ctx.customers.filter((c) =>
      customerMatchesSegment(segmentId as StandardSegmentId, c, ctx)
    ).length;

    return {
      id: segment.id,
      name: segment.name,
      description: segment.description,
      iconKey: segment.iconKey,
      clientCount,
      type: "standard" as const,
    };
  }

  const custom = await prisma.customSegment.findFirst({
    where: { id: segmentId, salonId },
  });
  if (!custom) return null;

  return {
    id: custom.id,
    name: custom.name,
    description: custom.description ?? "",
    iconKey: "sparkles",
    clientCount: 0,
    type: "custom" as const,
  };
}

export async function createCustomSegment(formData: FormData) {
  const session = await requireSession();

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = customSegmentSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const segment = await prisma.customSegment.create({
    data: {
      salonId: session.user.salonId,
      name: parsed.data.name,
      description: parsed.data.description,
    },
  });

  revalidatePath("/clients/segments");
  revalidatePath("/customers/segments");
  return { success: true, id: segment.id };
}

export async function deleteCustomSegment(id: string) {
  const session = await requireSession();

  const existing = await prisma.customSegment.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!existing) return { error: "Segment not found" };

  await prisma.customSegment.delete({ where: { id } });

  revalidatePath("/clients/segments");
  revalidatePath("/customers/segments");
  return { success: true };
}
