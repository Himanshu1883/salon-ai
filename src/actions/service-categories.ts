"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { serviceCategorySchema } from "@/lib/validations";
import { PrismaClientKnownRequestError } from "@/generated/prisma/internal/prismaNamespace";
import { revalidateSalonCache } from "@/lib/salon-cache";

function revalidateCatalog(salonId: string) {
  revalidateSalonCache(salonId, "catalog", "check-in");
}

function actionError(err: unknown, fallback: string) {
  console.error(fallback, err);
  if (err instanceof Error) {
    if (err.message === "Unauthorized") {
      return { error: "Your session expired. Please sign in again." };
    }
    if (err.message.includes("timeout") || err.message.includes("Timed out")) {
      return { error: "Database timed out. Please try again." };
    }
  }
  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === "P2003") {
      return {
        error:
          "Salon account not found. Sign out, sign in again, or contact support.",
      };
    }
    if (err.code === "P2002") {
      return { error: "A category with this name already exists." };
    }
    return { error: `${fallback} (${err.code}: ${err.message})` };
  }
  if (err instanceof Error && err.message) {
    return { error: `${fallback} ${err.message}` };
  }
  return { error: fallback };
}

export async function getServiceCategories() {
  const session = await requireSession();
  return prisma.serviceCategory.findMany({
    where: { salonId: session.user.salonId },
    include: { _count: { select: { services: true } } },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createServiceCategory(formData: FormData) {
  try {
    const session = await requireSession();
    const raw = {
      name: formData.get("name") as string,
      sortOrder: (formData.get("sortOrder") as string) || undefined,
    };

    const parsed = serviceCategorySchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const sortOrder =
      parsed.data.sortOrder ??
      (await prisma.serviceCategory.count({
        where: { salonId: session.user.salonId },
      }));

    const category = await prisma.serviceCategory.create({
      data: {
        salonId: session.user.salonId,
        name: parsed.data.name,
        sortOrder,
      },
      select: { id: true, name: true, sortOrder: true },
    });

    revalidateCatalog(session.user.salonId);
    return { success: true, category };
  } catch (err) {
    return actionError(err, "Could not save category. Please try again.");
  }
}

export async function updateServiceCategory(id: string, formData: FormData) {
  try {
    const session = await requireSession();
    const raw = {
      name: formData.get("name") as string,
      sortOrder: (formData.get("sortOrder") as string) || undefined,
    };

    const parsed = serviceCategorySchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const existing = await prisma.serviceCategory.findFirst({
      where: { id, salonId: session.user.salonId },
    });
    if (!existing) return { error: "Category not found" };

    const category = await prisma.serviceCategory.update({
      where: { id },
      data: {
        name: parsed.data.name,
        ...(parsed.data.sortOrder !== undefined
          ? { sortOrder: parsed.data.sortOrder }
          : {}),
      },
      select: { id: true, name: true, sortOrder: true },
    });

    revalidateCatalog(session.user.salonId);
    return { success: true, category };
  } catch (err) {
    return actionError(err, "Could not update category. Please try again.");
  }
}

export async function deleteServiceCategory(id: string) {
  try {
    const session = await requireSession();
    const category = await prisma.serviceCategory.findFirst({
      where: { id, salonId: session.user.salonId },
      include: { _count: { select: { services: true } } },
    });
    if (!category) return { error: "Category not found" };
    if (category._count.services > 0) {
      return {
        error: "Remove or reassign services before deleting this category",
      };
    }

    await prisma.serviceCategory.delete({ where: { id } });
    revalidateCatalog(session.user.salonId);
    return { success: true };
  } catch (err) {
    return actionError(err, "Could not delete category. Please try again.");
  }
}

export async function reorderCategories(orderedIds: string[]) {
  try {
    const session = await requireSession();
    const categories = await prisma.serviceCategory.findMany({
      where: { salonId: session.user.salonId },
      select: { id: true },
    });
    const validIds = new Set(categories.map((c) => c.id));
    if (orderedIds.some((id) => !validIds.has(id))) {
      return { error: "Invalid category order" };
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.serviceCategory.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    revalidateCatalog(session.user.salonId);
    return { success: true };
  } catch (err) {
    return actionError(err, "Could not reorder categories. Please try again.");
  }
}
