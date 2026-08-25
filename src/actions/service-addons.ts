"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions/require";
import { addOnSchema } from "@/lib/validations";
import { catalogInclude, serializeCatalogItem } from "@/lib/catalog/service-serializer";
import { scheduleSalonCacheRevalidation } from "@/lib/salon-cache";

function revalidateServices(salonId: string) {
  scheduleSalonCacheRevalidation(salonId, "catalog", "check-in", "billing");
}

function parseAddOnForm(formData: FormData) {
  return {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    duration: formData.get("duration") as string,
    price: formData.get("price") as string,
    categoryId: formData.get("categoryId") as string,
    audience: (formData.get("audience") as string) || "UNISEX",
    status: (formData.get("status") as string) || "ACTIVE",
    onlineBooking: formData.get("onlineBooking") === "true",
    inStoreBooking: formData.get("inStoreBooking") === "true",
    parentServiceIds: formData.getAll("parentServiceIds") as string[],
    employeeIds: formData.getAll("employeeIds") as string[],
  };
}

export async function createAddOn(formData: FormData) {
  const session = await requirePermission("addons.create");
  const salonId = session.user.salonId!;
  const parsed = addOnSchema.safeParse(parseAddOnForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const category = await prisma.serviceCategory.findFirst({
    where: { id: parsed.data.categoryId, salonId },
  });
  if (!category) return { error: "Category not found" };

  if (parsed.data.parentServiceIds?.length) {
    const parents = await prisma.service.count({
      where: {
        id: { in: parsed.data.parentServiceIds },
        salonId,
        catalogType: "SERVICE",
      },
    });
    if (parents !== parsed.data.parentServiceIds.length) {
      return { error: "One or more parent services were not found" };
    }
  }

  const maxOrder = await prisma.service.aggregate({
    where: { salonId, categoryId: parsed.data.categoryId },
    _max: { sortOrder: true },
  });

  const addOn = await prisma.service.create({
    data: {
      salonId,
      name: parsed.data.name,
      description: parsed.data.description,
      duration: parsed.data.duration,
      price: parsed.data.price,
      categoryId: parsed.data.categoryId,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      catalogType: "ADD_ON",
      audience: parsed.data.audience,
      status: parsed.data.status,
      onlineBooking: parsed.data.onlineBooking,
      inStoreBooking: parsed.data.inStoreBooking,
      addOnParentLinks: parsed.data.parentServiceIds?.length
        ? {
            create: parsed.data.parentServiceIds.map((parentServiceId, index) => ({
              parentServiceId,
              sortOrder: index,
            })),
          }
        : undefined,
      employees: parsed.data.employeeIds?.length
        ? {
            create: parsed.data.employeeIds.map((employeeId) => ({ employeeId })),
          }
        : undefined,
    },
    include: catalogInclude,
  });

  revalidateServices(salonId);
  return { success: true, service: serializeCatalogItem(addOn) };
}

export async function updateAddOn(id: string, formData: FormData) {
  const session = await requirePermission("addons.update");
  const salonId = session.user.salonId!;
  const parsed = addOnSchema.safeParse(parseAddOnForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.service.findFirst({
    where: { id, salonId, catalogType: "ADD_ON" },
  });
  if (!existing) return { error: "Add-on not found" };

  if (parsed.data.parentServiceIds?.length) {
    const parents = await prisma.service.count({
      where: {
        id: { in: parsed.data.parentServiceIds },
        salonId,
        catalogType: "SERVICE",
      },
    });
    if (parents !== parsed.data.parentServiceIds.length) {
      return { error: "One or more parent services were not found" };
    }
  }

  await prisma.$transaction([
    prisma.employeeService.deleteMany({ where: { serviceId: id } }),
    prisma.serviceAddOnLink.deleteMany({ where: { addOnServiceId: id } }),
    prisma.service.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        duration: parsed.data.duration,
        price: parsed.data.price,
        categoryId: parsed.data.categoryId,
        audience: parsed.data.audience,
        status: parsed.data.status,
        onlineBooking: parsed.data.onlineBooking,
        inStoreBooking: parsed.data.inStoreBooking,
        addOnParentLinks: parsed.data.parentServiceIds?.length
          ? {
              create: parsed.data.parentServiceIds.map((parentServiceId, index) => ({
                parentServiceId,
                sortOrder: index,
              })),
            }
          : undefined,
        employees: parsed.data.employeeIds?.length
          ? {
              create: parsed.data.employeeIds.map((employeeId) => ({ employeeId })),
            }
          : undefined,
      },
    }),
  ]);

  revalidateServices(salonId);
  return { success: true };
}
