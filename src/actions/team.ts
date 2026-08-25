"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, requireOwnerOrManager } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions/require";
import { cachedBySalon, revalidateSalonCache } from "@/lib/salon-cache";
import { employeeSchema, employeeProfileSchema } from "@/lib/validations";
import { saveEmployeeDocument } from "@/lib/employee-upload";
import { parseOtherDocuments } from "@/lib/employee";
import {
  setLinkedLoginActiveState,
} from "@/lib/employee-login-link";
import { invalidateResolvedPermissionsCache } from "@/lib/permissions/resolve";

const teamMemberSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  role: true,
  specialties: true,
  avatarUrl: true,
  status: true,
  services: {
    select: {
      service: { select: { id: true, name: true } },
    },
  },
} as const;

function revalidateTeamAccess(salonId: string, userIds: string[]) {
  revalidatePath("/team/access");
  for (const userId of userIds) {
    invalidateResolvedPermissionsCache(salonId, userId);
  }
}

async function syncStaffLoginWithStatus(
  salonId: string,
  employee: { id: string; email: string | null },
  status: string
) {
  const loginActive = status === "active" || status === "on_break";
  return setLinkedLoginActiveState(salonId, employee, loginActive);
}

function revalidateTeam(salonId: string) {
  revalidateSalonCache(
    salonId,
    "team",
    "dashboard-widgets",
    "dashboard-kpis",
    "queue"
  );
  revalidatePath("/team/members");
  revalidatePath("/team/shifts");
  revalidatePath("/employees");
  revalidatePath("/dashboard");
}

async function fetchTeamMembers(salonId: string) {
  return prisma.employee.findMany({
    where: { salonId },
    select: teamMemberSelect,
    orderBy: { name: "asc" },
  });
}

const getCachedTeamMembers = cachedBySalon("team", fetchTeamMembers, {
  revalidate: 60,
  key: "list",
});

export async function getTeamMembers(search?: string) {
  await requirePermission("team.view");
  const session = await requireSession();
  if (search) {
    return prisma.employee.findMany({
      where: {
        salonId: session.user.salonId,
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
          { role: { contains: search, mode: "insensitive" } },
        ],
      },
      select: teamMemberSelect,
      orderBy: { name: "asc" },
    });
  }
  return getCachedTeamMembers(session.user.salonId);
}

export async function getTeamMember(id: string) {
  await requirePermission("team.view");
  const session = await requireSession();
  return prisma.employee.findFirst({
    where: { id, salonId: session.user.salonId },
    include: {
      services: { include: { service: true } },
    },
  });
}

export async function createTeamMember(formData: FormData) {
  const session = await requirePermission("team.create");
  const serviceIds = formData.getAll("serviceIds") as string[];

  const raw = {
    name: formData.get("name") as string,
    phone: (formData.get("phone") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    role: formData.get("role") as string,
    specialties: (formData.get("specialties") as string) || undefined,
    status: formData.get("status") as string,
    serviceIds,
  };

  const parsed = employeeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const member = await prisma.employee.create({
    data: {
      salonId: session.user.salonId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      role: parsed.data.role,
      specialties: parsed.data.specialties,
      status: parsed.data.status,
      services: parsed.data.serviceIds?.length
        ? {
            create: parsed.data.serviceIds.map((serviceId) => ({
              serviceId,
            })),
          }
        : undefined,
    },
    select: teamMemberSelect,
  });

  revalidateTeam(session.user.salonId);
  return { success: true as const, id: member.id, member };
}

export async function updateTeamMember(id: string, formData: FormData) {
  const session = await requirePermission("team.update");
  const serviceIds = formData.getAll("serviceIds") as string[];

  const raw = {
    name: formData.get("name") as string,
    phone: (formData.get("phone") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    role: formData.get("role") as string,
    specialties: (formData.get("specialties") as string) || undefined,
    status: formData.get("status") as string,
    serviceIds,
  };

  const parsed = employeeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.employee.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!existing) return { error: "Team member not found" };

  await prisma.$transaction([
    prisma.employeeService.deleteMany({ where: { employeeId: id } }),
    prisma.employee.update({
      where: { id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        role: parsed.data.role,
        specialties: parsed.data.specialties,
        status: parsed.data.status,
        services: parsed.data.serviceIds?.length
          ? {
              create: parsed.data.serviceIds.map((serviceId) => ({
                serviceId,
              })),
            }
          : undefined,
      },
    }),
  ]);

  if (parsed.data.status !== existing.status) {
    const affectedUserIds = await syncStaffLoginWithStatus(
      session.user.salonId,
      {
        id: existing.id,
        email: parsed.data.email ?? existing.email,
      },
      parsed.data.status
    );
    revalidateTeamAccess(session.user.salonId, affectedUserIds);
  }

  const member = await prisma.employee.findFirst({
    where: { id, salonId: session.user.salonId },
    select: teamMemberSelect,
  });

  revalidateTeam(session.user.salonId);
  revalidatePath(`/team/members/${id}`);
  return { success: true as const, member };
}

export async function updateTeamMemberProfile(id: string, formData: FormData) {
  await requireOwnerOrManager();
  const session = await requireSession();

  const raw = {
    addressLine1: (formData.get("addressLine1") as string) || undefined,
    addressLine2: (formData.get("addressLine2") as string) || undefined,
    city: (formData.get("city") as string) || undefined,
    state: (formData.get("state") as string) || undefined,
    pincode: (formData.get("pincode") as string) || undefined,
    country: (formData.get("country") as string) || undefined,
    aadharNumber: (formData.get("aadharNumber") as string) || undefined,
    panNumber: ((formData.get("panNumber") as string) || undefined)?.toUpperCase(),
  };

  const parsed = employeeProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const member = await prisma.employee.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!member) return { error: "Team member not found" };

  await prisma.employee.update({
    where: { id },
    data: {
      addressLine1: parsed.data.addressLine1 || null,
      addressLine2: parsed.data.addressLine2 || null,
      city: parsed.data.city || null,
      state: parsed.data.state || null,
      pincode: parsed.data.pincode || null,
      country: parsed.data.country || "India",
      aadharNumber: parsed.data.aadharNumber || null,
      panNumber: parsed.data.panNumber || null,
    },
  });

  revalidateTeam(session.user.salonId);
  return { success: true };
}

type EmployeeDocumentKind = "aadhar" | "pan" | "offerLetter" | "other";

const DOCUMENT_FIELD: Record<
  Exclude<EmployeeDocumentKind, "other">,
  "aadharDocumentUrl" | "panDocumentUrl" | "offerLetterUrl"
> = {
  aadhar: "aadharDocumentUrl",
  pan: "panDocumentUrl",
  offerLetter: "offerLetterUrl",
};

export async function uploadEmployeeDocument(
  employeeId: string,
  formData: FormData
) {
  await requireOwnerOrManager();
  const session = await requireSession();

  const kind = formData.get("kind") as EmployeeDocumentKind;
  const file = formData.get("file") as File | null;
  const documentName = (formData.get("documentName") as string)?.trim();

  if (!file || file.size === 0) {
    return { error: "Select a file to upload" };
  }

  if (!["aadhar", "pan", "offerLetter", "other"].includes(kind)) {
    return { error: "Invalid document type" };
  }

  if (kind === "other" && !documentName) {
    return { error: "Document name is required" };
  }

  const member = await prisma.employee.findFirst({
    where: { id: employeeId, salonId: session.user.salonId },
  });
  if (!member) return { error: "Team member not found" };

  const upload = await saveEmployeeDocument(
    file,
    session.user.salonId,
    employeeId
  );
  if (upload.error) return { error: upload.error };
  if (!upload.path) return { error: "Upload failed" };

  if (kind === "other") {
    const existing = parseOtherDocuments(member.otherDocuments);
    existing.push({ name: documentName!, url: upload.path });
    await prisma.employee.update({
      where: { id: employeeId },
      data: { otherDocuments: JSON.stringify(existing) },
    });
  } else {
    await prisma.employee.update({
      where: { id: employeeId },
      data: { [DOCUMENT_FIELD[kind]]: upload.path },
    });
  }

  revalidateTeam(session.user.salonId);
  return { success: true, path: upload.path };
}

export async function removeEmployeeDocument(
  employeeId: string,
  formData: FormData
) {
  await requireOwnerOrManager();
  const session = await requireSession();

  const kind = formData.get("kind") as EmployeeDocumentKind;
  const documentUrl = formData.get("documentUrl") as string | null;

  const member = await prisma.employee.findFirst({
    where: { id: employeeId, salonId: session.user.salonId },
  });
  if (!member) return { error: "Team member not found" };

  if (kind === "other") {
    if (!documentUrl) return { error: "Document not found" };
    const existing = parseOtherDocuments(member.otherDocuments).filter(
      (doc) => doc.url !== documentUrl
    );
    await prisma.employee.update({
      where: { id: employeeId },
      data: {
        otherDocuments: existing.length ? JSON.stringify(existing) : null,
      },
    });
  } else if (["aadhar", "pan", "offerLetter"].includes(kind)) {
    await prisma.employee.update({
      where: { id: employeeId },
      data: { [DOCUMENT_FIELD[kind as Exclude<EmployeeDocumentKind, "other">]]: null },
    });
  } else {
    return { error: "Invalid document type" };
  }

  revalidateTeam(session.user.salonId);
  return { success: true };
}

export async function deactivateTeamMember(id: string) {
  const session = await requirePermission("team.delete");
  const member = await prisma.employee.findFirst({
    where: { id, salonId: session.user.salonId },
    select: { id: true, email: true },
  });
  if (!member) return { error: "Team member not found" };

  await prisma.employee.update({
    where: { id },
    data: { status: "inactive" },
  });

  const affectedUserIds = await syncStaffLoginWithStatus(
    session.user.salonId,
    member,
    "inactive"
  );

  revalidateTeam(session.user.salonId);
  revalidateTeamAccess(session.user.salonId, affectedUserIds);
  revalidatePath(`/team/members/${id}`);
  return { success: true as const };
}

export async function reactivateTeamMember(id: string) {
  const session = await requirePermission("team.update");
  const member = await prisma.employee.findFirst({
    where: { id, salonId: session.user.salonId },
    select: { id: true, email: true },
  });
  if (!member) return { error: "Team member not found" };

  await prisma.employee.update({
    where: { id },
    data: { status: "active" },
  });

  const affectedUserIds = await syncStaffLoginWithStatus(
    session.user.salonId,
    member,
    "active"
  );

  revalidateTeam(session.user.salonId);
  revalidateTeamAccess(session.user.salonId, affectedUserIds);
  revalidatePath(`/team/members/${id}`);
  return { success: true as const };
}

export async function deleteTeamMember(id: string) {
  const session = await requirePermission("team.delete");
  const member = await prisma.employee.findFirst({
    where: { id, salonId: session.user.salonId },
    select: { id: true, email: true },
  });
  if (!member) return { error: "Team member not found" };

  const affectedUserIds = await setLinkedLoginActiveState(
    session.user.salonId,
    member,
    false
  );

  await prisma.employee.delete({ where: { id } });

  revalidateTeam(session.user.salonId);
  revalidateTeamAccess(session.user.salonId, affectedUserIds);
  return { success: true as const };
}
