"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions/require";
import {
  computePackageDuration,
  computePackageItemsTotal,
  resolvePackagePrice,
} from "@/lib/catalog/package-pricing";
import { packageSchema } from "@/lib/validations";
import { scheduleSalonCacheRevalidation } from "@/lib/salon-cache";
import { catalogInclude, serializeCatalogItem } from "@/lib/catalog/service-serializer";

function revalidateServices(salonId: string) {
  scheduleSalonCacheRevalidation(salonId, "catalog-options", "check-in", "billing");
}

function parsePackageForm(formData: FormData) {
  return {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    categoryId: formData.get("categoryId") as string,
    audience: (formData.get("audience") as string) || "UNISEX",
    status: (formData.get("status") as string) || "ACTIVE",
    onlineBooking: formData.get("onlineBooking") === "true",
    inStoreBooking: formData.get("inStoreBooking") === "true",
    includedServiceIds: formData.getAll("includedServiceIds") as string[],
    pricingStrategy: formData.get("pricingStrategy") as string,
    customPrice: (formData.get("customPrice") as string) || undefined,
    discountPercent: (formData.get("discountPercent") as string) || undefined,
    discountAmount: (formData.get("discountAmount") as string) || undefined,
    employeeIds: formData.getAll("employeeIds") as string[],
  };
}

export async function createPackage(formData: FormData) {
  const session = await requirePermission("packages.create");
  const salonId = session.user.salonId!;
  const parsed = packageSchema.safeParse(parsePackageForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const category = await prisma.serviceCategory.findFirst({
    where: { id: parsed.data.categoryId, salonId },
  });
  if (!category) return { error: "Category not found" };

  const includedServices = await prisma.service.findMany({
    where: {
      id: { in: parsed.data.includedServiceIds },
      salonId,
      catalogType: "SERVICE",
      status: { not: "ARCHIVED" },
    },
    select: { id: true, price: true, duration: true },
  });
  if (includedServices.length !== parsed.data.includedServiceIds.length) {
    return { error: "One or more included services were not found" };
  }

  const itemsTotal = computePackageItemsTotal(includedServices);
  const { packagePrice } = resolvePackagePrice({
    itemsTotal,
    pricingStrategy: parsed.data.pricingStrategy,
    customPrice: parsed.data.customPrice,
    discountPercent: parsed.data.discountPercent,
    discountAmount: parsed.data.discountAmount,
  });
  const duration = computePackageDuration(includedServices);

  const maxOrder = await prisma.service.aggregate({
    where: { salonId, categoryId: parsed.data.categoryId },
    _max: { sortOrder: true },
  });

  const pkg = await prisma.service.create({
    data: {
      salonId,
      name: parsed.data.name,
      description: parsed.data.description,
      duration,
      price: packagePrice,
      categoryId: parsed.data.categoryId,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      catalogType: "PACKAGE",
      audience: parsed.data.audience,
      status: parsed.data.status,
      onlineBooking: parsed.data.onlineBooking,
      inStoreBooking: parsed.data.inStoreBooking,
      pricingStrategy: parsed.data.pricingStrategy,
      discountPercent: parsed.data.discountPercent ?? null,
      discountAmount: parsed.data.discountAmount ?? null,
      packageItems: {
        create: parsed.data.includedServiceIds.map((includedServiceId, index) => ({
          includedServiceId,
          sortOrder: index,
        })),
      },
      employees: parsed.data.employeeIds?.length
        ? {
            create: parsed.data.employeeIds.map((employeeId) => ({ employeeId })),
          }
        : undefined,
    },
    include: catalogInclude,
  });

  revalidateServices(salonId);
  return { success: true, service: serializeCatalogItem(pkg) };
}

export async function updatePackage(id: string, formData: FormData) {
  const session = await requirePermission("packages.update");
  const salonId = session.user.salonId!;
  const parsed = packageSchema.safeParse(parsePackageForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.service.findFirst({
    where: { id, salonId, catalogType: "PACKAGE" },
  });
  if (!existing) return { error: "Package not found" };

  const includedServices = await prisma.service.findMany({
    where: {
      id: { in: parsed.data.includedServiceIds },
      salonId,
      catalogType: "SERVICE",
      status: { not: "ARCHIVED" },
    },
    select: { id: true, price: true, duration: true },
  });
  if (includedServices.length !== parsed.data.includedServiceIds.length) {
    return { error: "One or more included services were not found" };
  }

  const itemsTotal = computePackageItemsTotal(includedServices);
  const { packagePrice } = resolvePackagePrice({
    itemsTotal,
    pricingStrategy: parsed.data.pricingStrategy,
    customPrice: parsed.data.customPrice,
    discountPercent: parsed.data.discountPercent,
    discountAmount: parsed.data.discountAmount,
  });
  const duration = computePackageDuration(includedServices);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.employeeService.deleteMany({ where: { serviceId: id } });
    await tx.servicePackageItem.deleteMany({ where: { packageId: id } });
    return tx.service.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        duration,
        price: packagePrice,
        categoryId: parsed.data.categoryId,
        audience: parsed.data.audience,
        status: parsed.data.status,
        onlineBooking: parsed.data.onlineBooking,
        inStoreBooking: parsed.data.inStoreBooking,
        pricingStrategy: parsed.data.pricingStrategy,
        discountPercent: parsed.data.discountPercent ?? null,
        discountAmount: parsed.data.discountAmount ?? null,
        packageItems: {
          create: parsed.data.includedServiceIds.map((includedServiceId, index) => ({
            includedServiceId,
            sortOrder: index,
          })),
        },
        employees: parsed.data.employeeIds?.length
          ? {
              create: parsed.data.employeeIds.map((employeeId) => ({ employeeId })),
            }
          : undefined,
      },
      include: catalogInclude,
    });
  });

  revalidateServices(salonId);
  return { success: true, service: serializeCatalogItem(updated) };
}

export async function previewPackagePricing(input: {
  includedServiceIds: string[];
  pricingStrategy: string;
  customPrice?: number;
  discountPercent?: number;
  discountAmount?: number;
}) {
  const session = await requirePermission("packages.view");
  const salonId = session.user.salonId!;

  const includedServices = await prisma.service.findMany({
    where: {
      id: { in: input.includedServiceIds },
      salonId,
      catalogType: "SERVICE",
    },
    select: { price: true, duration: true },
  });

  const itemsTotal = computePackageItemsTotal(includedServices);
  const duration = computePackageDuration(includedServices);
  const pricing = resolvePackagePrice({
    itemsTotal,
    pricingStrategy: input.pricingStrategy as
      | "STANDARD_TOTAL"
      | "CUSTOM_PRICE"
      | "PERCENTAGE_DISCOUNT"
      | "FIXED_DISCOUNT",
    customPrice: input.customPrice,
    discountPercent: input.discountPercent,
    discountAmount: input.discountAmount,
  });

  return { ...pricing, duration };
}
