"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions/require";
import { cachedBySalon, revalidateSalonCache } from "@/lib/salon-cache";
import {
  bulkCreateServicesSchema,
  bulkUpdateCatalogStatusSchema,
  serviceSchema,
} from "@/lib/validations";
import {
  catalogInclude,
  serializeCatalogItem,
} from "@/lib/catalog/service-serializer";

function revalidateServices(salonId: string) {
  revalidateSalonCache(salonId, "catalog", "check-in", "billing");
}

async function serviceHasHistory(id: string) {
  const [appointments, lineItems, queueServices, packageRefs] =
    await Promise.all([
      prisma.appointment.count({ where: { serviceId: id } }),
      prisma.invoiceLineItem.count({ where: { serviceId: id } }),
      prisma.queueService.count({ where: { serviceId: id } }),
      prisma.servicePackageItem.count({ where: { includedServiceId: id } }),
    ]);
  return appointments + lineItems + queueServices + packageRefs > 0;
}

function parseServiceForm(formData: FormData) {
  return {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    duration: formData.get("duration") as string,
    price: formData.get("price") as string,
    categoryId: formData.get("categoryId") as string,
    employeeIds: formData.getAll("employeeIds") as string[],
    audience: (formData.get("audience") as string) || "UNISEX",
    status: (formData.get("status") as string) || "ACTIVE",
    onlineBooking: formData.get("onlineBooking") !== "false",
    inStoreBooking: formData.get("inStoreBooking") !== "false",
    addOnServiceIds: formData.getAll("addOnServiceIds") as string[],
  };
}

async function fetchServicesGroupedByCategory(salonId: string) {
  const categories = await prisma.serviceCategory.findMany({
    where: { salonId },
    include: {
      services: {
        include: catalogInclude,
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const uncategorized = await prisma.service.findMany({
    where: { salonId, categoryId: null },
    include: catalogInclude,
    orderBy: { sortOrder: "asc" },
  });

  return {
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      sortOrder: category.sortOrder,
      categoryGroup: category.categoryGroup,
      services: category.services.map(serializeCatalogItem),
    })),
    uncategorized: uncategorized.map(serializeCatalogItem),
  };
}

const getCachedServicesGrouped = cachedBySalon(
  "catalog",
  fetchServicesGroupedByCategory,
  { revalidate: 60, key: "grouped" }
);

export async function getServiceOptions() {
  const session = await requireSession();
  return prisma.service.findMany({
    where: {
      salonId: session.user.salonId,
      status: { not: "ARCHIVED" },
      catalogType: { in: ["SERVICE", "PACKAGE"] },
    },
    select: { id: true, name: true, catalogType: true, price: true, duration: true },
    orderBy: { name: "asc" },
  });
}

export async function getBookableServices() {
  const session = await requireSession();
  return prisma.service.findMany({
    where: {
      salonId: session.user.salonId,
      status: "ACTIVE",
      catalogType: "SERVICE",
    },
    select: { id: true, name: true, price: true, duration: true, audience: true },
    orderBy: { name: "asc" },
  });
}

export async function getServices() {
  const session = await requireSession();
  return prisma.service.findMany({
    where: { salonId: session.user.salonId },
    include: catalogInclude,
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getServicesGroupedByCategory() {
  const session = await requirePermission("services.view");
  return getCachedServicesGrouped(session.user.salonId!);
}

export async function searchServices(query: string, categoryId?: string | null) {
  const session = await requireSession();
  const q = query.trim();
  return prisma.service.findMany({
    where: {
      salonId: session.user.salonId,
      ...(categoryId ? { categoryId } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    include: catalogInclude,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function createService(formData: FormData) {
  const session = await requirePermission("services.create");
  const salonId = session.user.salonId!;
  const parsed = serviceSchema.safeParse(parseServiceForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const category = await prisma.serviceCategory.findFirst({
    where: { id: parsed.data.categoryId, salonId },
  });
  if (!category) return { error: "Category not found" };

  if (parsed.data.addOnServiceIds?.length) {
    const addOnCount = await prisma.service.count({
      where: {
        id: { in: parsed.data.addOnServiceIds },
        salonId,
        catalogType: "ADD_ON",
      },
    });
    if (addOnCount !== parsed.data.addOnServiceIds.length) {
      return { error: "One or more add-ons were not found" };
    }
  }

  const maxOrder = await prisma.service.aggregate({
    where: { salonId, categoryId: parsed.data.categoryId },
    _max: { sortOrder: true },
  });

  const service = await prisma.service.create({
    data: {
      salonId,
      name: parsed.data.name,
      description: parsed.data.description,
      duration: parsed.data.duration,
      price: parsed.data.price,
      categoryId: parsed.data.categoryId,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      catalogType: "SERVICE",
      audience: parsed.data.audience,
      status: parsed.data.status,
      onlineBooking: parsed.data.onlineBooking,
      inStoreBooking: parsed.data.inStoreBooking,
      parentAddOnLinks: parsed.data.addOnServiceIds?.length
        ? {
            create: parsed.data.addOnServiceIds.map((addOnServiceId, index) => ({
              addOnServiceId,
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
  return { success: true, service: serializeCatalogItem(service) };
}

export async function updateService(id: string, formData: FormData) {
  const session = await requirePermission("services.update");
  const salonId = session.user.salonId!;
  const parsed = serviceSchema.safeParse(parseServiceForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const service = await prisma.service.findFirst({
    where: { id, salonId, catalogType: "SERVICE" },
  });
  if (!service) return { error: "Service not found" };

  const category = await prisma.serviceCategory.findFirst({
    where: { id: parsed.data.categoryId, salonId },
  });
  if (!category) return { error: "Category not found" };

  if (parsed.data.addOnServiceIds?.length) {
    const addOnCount = await prisma.service.count({
      where: {
        id: { in: parsed.data.addOnServiceIds },
        salonId,
        catalogType: "ADD_ON",
      },
    });
    if (addOnCount !== parsed.data.addOnServiceIds.length) {
      return { error: "One or more add-ons were not found" };
    }
  }

  await prisma.$transaction([
    prisma.employeeService.deleteMany({ where: { serviceId: id } }),
    prisma.serviceAddOnLink.deleteMany({ where: { parentServiceId: id } }),
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
        parentAddOnLinks: parsed.data.addOnServiceIds?.length
          ? {
              create: parsed.data.addOnServiceIds.map((addOnServiceId, index) => ({
                addOnServiceId,
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

export async function deleteService(id: string) {
  const session = await requireSession();
  const salonId = session.user.salonId!;
  const service = await prisma.service.findFirst({
    where: { id, salonId },
  });
  if (!service) return { error: "Service not found" };

  const permission =
    service.catalogType === "PACKAGE"
      ? "packages.delete"
      : service.catalogType === "ADD_ON"
        ? "addons.delete"
        : "services.delete";
  if (session.user.role !== "owner") {
    await requirePermission(permission);
  }

  if (await serviceHasHistory(id)) {
    await prisma.service.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
    revalidateServices(salonId);
    return { success: true, archived: true };
  }

  await prisma.service.delete({ where: { id } });
  revalidateServices(salonId);
  return { success: true };
}

export async function duplicateService(id: string) {
  const session = await requireSession();
  const salonId = session.user.salonId!;
  const service = await prisma.service.findFirst({
    where: { id, salonId },
    include: {
      employees: true,
      packageItems: true,
      parentAddOnLinks: true,
      addOnParentLinks: true,
    },
  });
  if (!service) return { error: "Service not found" };

  const maxOrder = await prisma.service.aggregate({
    where: { salonId, categoryId: service.categoryId },
    _max: { sortOrder: true },
  });

  await prisma.service.create({
    data: {
      salonId,
      name: `${service.name} (copy)`,
      description: service.description,
      duration: service.duration,
      price: service.price,
      categoryId: service.categoryId,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      catalogType: service.catalogType,
      audience: service.audience,
      status: service.status,
      onlineBooking: service.onlineBooking,
      inStoreBooking: service.inStoreBooking,
      pricingStrategy: service.pricingStrategy,
      discountPercent: service.discountPercent,
      discountAmount: service.discountAmount,
      employees: service.employees.length
        ? { create: service.employees.map((e) => ({ employeeId: e.employeeId })) }
        : undefined,
      packageItems: service.packageItems.length
        ? {
            create: service.packageItems.map((item) => ({
              includedServiceId: item.includedServiceId,
              sortOrder: item.sortOrder,
              quantity: item.quantity,
            })),
          }
        : undefined,
      parentAddOnLinks: service.parentAddOnLinks.length
        ? {
            create: service.parentAddOnLinks.map((link) => ({
              addOnServiceId: link.addOnServiceId,
              sortOrder: link.sortOrder,
            })),
          }
        : undefined,
      addOnParentLinks: service.addOnParentLinks.length
        ? {
            create: service.addOnParentLinks.map((link) => ({
              parentServiceId: link.parentServiceId,
              sortOrder: link.sortOrder,
            })),
          }
        : undefined,
    },
  });

  revalidateServices(salonId);
  return { success: true };
}

export async function bulkDeleteServices(ids: string[]) {
  const session = await requirePermission("services.delete");
  const salonId = session.user.salonId!;
  if (ids.length === 0) return { error: "No services selected" };

  const services = await prisma.service.findMany({
    where: { id: { in: ids }, salonId },
    select: { id: true },
  });

  if (services.length !== ids.length) {
    return { error: "Some services were not found" };
  }

  const toArchive: string[] = [];
  const toDelete: string[] = [];

  for (const { id } of services) {
    if (await serviceHasHistory(id)) {
      toArchive.push(id);
    } else {
      toDelete.push(id);
    }
  }

  await prisma.$transaction([
    ...(toArchive.length
      ? [
          prisma.service.updateMany({
            where: { id: { in: toArchive }, salonId },
            data: { status: "ARCHIVED" },
          }),
        ]
      : []),
    ...(toDelete.length
      ? [
          prisma.service.deleteMany({
            where: { id: { in: toDelete }, salonId },
          }),
        ]
      : []),
  ]);

  revalidateServices(salonId);
  return {
    success: true,
    deletedCount: toDelete.length,
    archivedCount: toArchive.length,
  };
}

export async function bulkUpdateCatalogStatus(ids: string[], status: string) {
  const session = await requirePermission("services.update");
  const salonId = session.user.salonId!;
  const parsed = bulkUpdateCatalogStatusSchema.safeParse({ ids, status });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const count = await prisma.service.updateMany({
    where: { id: { in: parsed.data.ids }, salonId },
    data: { status: parsed.data.status },
  });

  revalidateServices(salonId);
  return { success: true, updatedCount: count.count };
}

export type BulkServiceInput = {
  name: string;
  description?: string;
  duration: number;
  price: number;
  categoryId: string;
};

export async function bulkCreateServices(services: BulkServiceInput[]) {
  const session = await requirePermission("services.create");
  const salonId = session.user.salonId!;
  const parsed = bulkCreateServicesSchema.safeParse({ services });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const categoryIds = [...new Set(parsed.data.services.map((s) => s.categoryId))];
  const categories = await prisma.serviceCategory.findMany({
    where: { id: { in: categoryIds }, salonId },
    select: { id: true },
  });
  if (categories.length !== categoryIds.length) {
    return { error: "One or more categories were not found" };
  }

  const maxOrders = await prisma.service.groupBy({
    by: ["categoryId"],
    where: { salonId, categoryId: { in: categoryIds } },
    _max: { sortOrder: true },
  });
  const nextOrderByCategory = new Map(
    maxOrders.map((row) => [row.categoryId, (row._max.sortOrder ?? -1) + 1])
  );

  const created = await prisma.$transaction(
    parsed.data.services.map((item) => {
      const sortOrder = nextOrderByCategory.get(item.categoryId) ?? 0;
      nextOrderByCategory.set(item.categoryId, sortOrder + 1);
      return prisma.service.create({
        data: {
          salonId,
          name: item.name,
          description: item.description,
          duration: item.duration,
          price: item.price,
          categoryId: item.categoryId,
          sortOrder,
          catalogType: "SERVICE",
        },
        include: catalogInclude,
      });
    })
  );

  revalidateServices(salonId);
  return {
    success: true,
    services: created.map((service) => serializeCatalogItem(service)),
  };
}

export async function reorderServices(categoryId: string, orderedIds: string[]) {
  const session = await requirePermission("services.update");
  const salonId = session.user.salonId!;
  const services = await prisma.service.findMany({
    where: { salonId, categoryId },
    select: { id: true },
  });
  const validIds = new Set(services.map((s) => s.id));
  if (
    orderedIds.length !== services.length ||
    orderedIds.some((id) => !validIds.has(id))
  ) {
    return { error: "Invalid service order" };
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.service.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  revalidateServices(salonId);
  return { success: true };
}
