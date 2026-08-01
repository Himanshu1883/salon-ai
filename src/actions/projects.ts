"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { projectSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import type { ProjectStatus } from "@/lib/projects";

export type ProjectListItem = Awaited<ReturnType<typeof getProjects>>[number];

export async function getProjects(statuses?: ProjectStatus[]) {
  const session = await requireSession();

  return prisma.project.findMany({
    where: {
      salonId: session.user.salonId,
      ...(statuses?.length ? { status: { in: statuses } } : {}),
    },
    include: {
      assignedEmployee: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });
}

export async function createProject(formData: FormData) {
  const session = await requireSession();

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    status: (formData.get("status") as string) || undefined,
    dueDate: (formData.get("dueDate") as string) || undefined,
    assignedEmployeeId: (formData.get("assignedEmployeeId") as string) || undefined,
    priority: (formData.get("priority") as string) || undefined,
  };

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (parsed.data.assignedEmployeeId) {
    const employee = await prisma.employee.findFirst({
      where: {
        id: parsed.data.assignedEmployeeId,
        salonId: session.user.salonId,
      },
    });
    if (!employee) return { error: "Assigned employee not found" };
  }

  await prisma.project.create({
    data: {
      salonId: session.user.salonId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      status: parsed.data.status ?? "PLANNING",
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      assignedEmployeeId: parsed.data.assignedEmployeeId || null,
      priority: parsed.data.priority ?? null,
    },
  });

  revalidatePath("/projects");
  return { success: true };
}

export async function updateProject(id: string, formData: FormData) {
  const session = await requireSession();

  const existing = await prisma.project.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!existing) return { error: "Project not found" };

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    status: (formData.get("status") as string) || undefined,
    dueDate: (formData.get("dueDate") as string) || undefined,
    assignedEmployeeId: (formData.get("assignedEmployeeId") as string) || undefined,
    priority: (formData.get("priority") as string) || undefined,
  };

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (parsed.data.assignedEmployeeId) {
    const employee = await prisma.employee.findFirst({
      where: {
        id: parsed.data.assignedEmployeeId,
        salonId: session.user.salonId,
      },
    });
    if (!employee) return { error: "Assigned employee not found" };
  }

  await prisma.project.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      status: parsed.data.status ?? existing.status,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      assignedEmployeeId: parsed.data.assignedEmployeeId || null,
      priority: parsed.data.priority ?? null,
    },
  });

  revalidatePath("/projects");
  return { success: true };
}

export async function updateProjectStatus(id: string, status: ProjectStatus) {
  const session = await requireSession();

  const existing = await prisma.project.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!existing) return { error: "Project not found" };

  await prisma.project.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/projects");
  return { success: true };
}

export async function deleteProject(id: string) {
  const session = await requireSession();

  const existing = await prisma.project.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!existing) return { error: "Project not found" };

  await prisma.project.delete({ where: { id } });

  revalidatePath("/projects");
  return { success: true };
}
