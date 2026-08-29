import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { computePackageDuration } from "@/lib/catalog/package-pricing";
import type { CommitImportRecord, ImportCommitResult } from "./types";
import { duplicateKey } from "./normalize";
import { MAX_IMPORT_RECORDS } from "./file-validation";

const DEFAULT_DURATION = 30;
const CHUNK = 150;

function norm(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function catalogKey(audience: string | null | undefined, category: string, name: string) {
  return duplicateKey([audience, category, name]);
}

async function chunkedCreate<T>(items: T[], fn: (slice: T[]) => Promise<unknown>) {
  for (let i = 0; i < items.length; i += CHUNK) {
    await fn(items.slice(i, i + CHUNK));
  }
}

export async function commitServiceMenuImport(options: {
  salonId: string;
  userId: string;
  filename: string;
  fileType: string;
  records: CommitImportRecord[];
}): Promise<ImportCommitResult> {
  const records = options.records.slice(0, MAX_IMPORT_RECORDS);
  const toCreate = records.filter((record) => record.action === "CREATE");
  const toUpdate = records.filter((record) => record.action === "UPDATE");
  const skipped = records.filter((record) => record.action === "SKIP").length;
  const problems: Array<{ name: string; reason: string }> = [];

  const result = await prisma.$transaction(
    async (tx) => {
      const [existingCategories, existingServices] = await Promise.all([
        tx.serviceCategory.findMany({
          where: { salonId: options.salonId },
          select: { id: true, name: true, sortOrder: true, categoryGroup: true },
        }),
        tx.service.findMany({
          where: { salonId: options.salonId },
          select: {
            id: true,
            name: true,
            audience: true,
            price: true,
            duration: true,
            categoryId: true,
            catalogType: true,
            category: { select: { name: true } },
          },
        }),
      ]);

      const categoryByNorm = new Map(
        existingCategories.map((category) => [norm(category.name), category])
      );
      let nextCategoryOrder =
        existingCategories.reduce((max, category) => Math.max(max, category.sortOrder), -1) + 1;

      const neededCategories = new Map<
        string,
        { name: string; categoryGroup: "SERVICES" | "PACKAGES" }
      >();
      for (const record of [...toCreate, ...toUpdate]) {
        const name = record.category.trim();
        if (!name || categoryByNorm.has(norm(name))) continue;
        const group =
          toCreate.some(
            (item) =>
              item.category.trim().toLowerCase() === name.toLowerCase() &&
              item.type === "SERVICE"
          )
            ? "SERVICES"
            : record.type === "PACKAGE"
              ? "PACKAGES"
              : "SERVICES";
        if (!neededCategories.has(norm(name))) {
          neededCategories.set(norm(name), { name, categoryGroup: group });
        }
      }

      if (neededCategories.size > 0) {
        await tx.serviceCategory.createMany({
          data: [...neededCategories.values()].map((category, index) => ({
            salonId: options.salonId,
            name: category.name,
            categoryGroup: category.categoryGroup,
            sortOrder: nextCategoryOrder + index,
          })),
        });
        const refreshed = await tx.serviceCategory.findMany({
          where: { salonId: options.salonId },
          select: { id: true, name: true, sortOrder: true, categoryGroup: true },
        });
        categoryByNorm.clear();
        for (const category of refreshed) {
          categoryByNorm.set(norm(category.name), category);
        }
      }

      const servicesByFull = new Map(
        existingServices.map((service) => [
          catalogKey(service.audience, service.category?.name ?? "", service.name),
          service,
        ])
      );
      const servicesByName = new Map<string, (typeof existingServices)[number]>();
      for (const service of existingServices) {
        servicesByName.set(norm(service.name), service);
      }

      const orderByCategory = new Map<string, number>();
      for (const service of existingServices) {
        if (!service.categoryId) continue;
        orderByCategory.set(
          service.categoryId,
          Math.max(orderByCategory.get(service.categoryId) ?? -1, 0)
        );
      }
      const nextOrder = (categoryId: string) => {
        const current = (orderByCategory.get(categoryId) ?? -1) + 1;
        orderByCategory.set(categoryId, current);
        return current;
      };

      let updated = 0;
      for (const record of toUpdate) {
        if (!record.existingServiceId) {
          problems.push({ name: record.name, reason: "Update requested without a matching service." });
          continue;
        }
        const existing = existingServices.find(
          (service) => service.id === record.existingServiceId
        );
        if (!existing) {
          problems.push({ name: record.name, reason: "Existing service was not found in this salon." });
          continue;
        }
        const category = categoryByNorm.get(norm(record.category));
        await tx.service.update({
          where: { id: existing.id },
          data: {
            price: record.price ?? existing.price,
            description: record.notes || undefined,
            isStartingPrice: record.isStartingPrice,
            audience: record.audience ?? existing.audience,
            categoryId: category?.id ?? existing.categoryId,
          },
        });
        updated += 1;
      }

      const standalone = toCreate.filter((record) => record.type === "SERVICE");
      const packages = toCreate.filter((record) => record.type === "PACKAGE");
      const createPayload: Prisma.ServiceCreateManyInput[] = [];

      for (const record of standalone) {
        if (!record.name.trim()) {
          problems.push({ name: record.name || "(missing)", reason: "Missing service name." });
          continue;
        }
        if (record.price == null) {
          problems.push({ name: record.name, reason: "Missing price." });
          continue;
        }
        if (!record.audience) {
          problems.push({ name: record.name, reason: "Audience still needs review." });
          continue;
        }
        const category = categoryByNorm.get(norm(record.category));
        if (!category) {
          problems.push({ name: record.name, reason: "Category could not be created." });
          continue;
        }
        const key = catalogKey(record.audience, category.name, record.name);
        if (servicesByFull.has(key)) {
          problems.push({ name: record.name, reason: "Already exists; skipped to avoid overwrite." });
          continue;
        }
        createPayload.push({
          salonId: options.salonId,
          name: record.name.trim(),
          description: record.notes || null,
          duration: DEFAULT_DURATION,
          price: record.price,
          categoryId: category.id,
          sortOrder: nextOrder(category.id),
          catalogType: "SERVICE",
          audience: record.audience,
          isStartingPrice: record.isStartingPrice,
          status: "ACTIVE",
          onlineBooking: true,
          inStoreBooking: true,
        });
      }

      await chunkedCreate(createPayload, (slice) => tx.service.createMany({ data: slice }));

      const afterCreate = await tx.service.findMany({
        where: { salonId: options.salonId },
        select: {
          id: true,
          name: true,
          audience: true,
          price: true,
          duration: true,
          categoryId: true,
          catalogType: true,
          category: { select: { name: true } },
        },
      });
      servicesByFull.clear();
      servicesByName.clear();
      for (const service of afterCreate) {
        servicesByFull.set(
          catalogKey(service.audience, service.category?.name ?? "", service.name),
          service
        );
        servicesByName.set(norm(service.name), service);
      }

      let servicesReused = 0;
      let packagesCreated = 0;
      const inclusionCreates: Prisma.ServiceCreateManyInput[] = [];

      function resolveIncluded(
        itemName: string,
        audience: CommitImportRecord["audience"],
        categoryName: string
      ) {
        const exact =
          (audience && servicesByFull.get(catalogKey(audience, categoryName, itemName))) ||
          servicesByName.get(norm(itemName));
        return exact;
      }

      for (const record of packages) {
        for (const item of record.includedItems) {
          if (item.complimentary) continue;
          if (resolveIncluded(item.name, record.audience, record.category)) {
            servicesReused += 1;
            continue;
          }
          const category = categoryByNorm.get(norm(record.category));
          if (!category || !record.audience) continue;
          inclusionCreates.push({
            salonId: options.salonId,
            name: item.name,
            description: "Included in imported package",
            duration: DEFAULT_DURATION,
            price: item.unitPrice ?? 0,
            categoryId: category.id,
            sortOrder: nextOrder(category.id),
            catalogType: "SERVICE",
            audience: record.audience,
            isStartingPrice: false,
            status: "ACTIVE",
            onlineBooking: true,
            inStoreBooking: true,
          });
        }
      }

      if (inclusionCreates.length > 0) {
        await chunkedCreate(inclusionCreates, (slice) =>
          tx.service.createMany({ data: slice })
        );
        const refreshed = await tx.service.findMany({
          where: { salonId: options.salonId },
          select: {
            id: true,
            name: true,
            audience: true,
            price: true,
            duration: true,
            categoryId: true,
            catalogType: true,
            category: { select: { name: true } },
          },
        });
        servicesByFull.clear();
        servicesByName.clear();
        for (const service of refreshed) {
          servicesByFull.set(
            catalogKey(service.audience, service.category?.name ?? "", service.name),
            service
          );
          servicesByName.set(norm(service.name), service);
        }
      }

      for (const record of packages) {
        if (!record.name.trim()) {
          problems.push({ name: record.name || "(package)", reason: "Missing package name." });
          continue;
        }
        if (record.price == null) {
          problems.push({ name: record.name, reason: "Package price is missing." });
          continue;
        }
        if (!record.audience) {
          problems.push({ name: record.name, reason: "Audience still needs review." });
          continue;
        }
        const category = categoryByNorm.get(norm(record.category));
        if (!category) {
          problems.push({ name: record.name, reason: "Category could not be created." });
          continue;
        }

        const links: { includedServiceId: string; quantity: number; sortOrder: number }[] = [];
        const includedServices: { price: number; duration: number; quantity: number }[] = [];
        let sort = 0;
        for (const item of record.includedItems) {
          if (item.complimentary) continue;
          const resolved = resolveIncluded(item.name, record.audience, record.category);
          if (!resolved) continue;
          const existingLink = links.find((link) => link.includedServiceId === resolved.id);
          if (existingLink) {
            existingLink.quantity += item.quantity;
            continue;
          }
          links.push({
            includedServiceId: resolved.id,
            quantity: item.quantity,
            sortOrder: sort++,
          });
          includedServices.push({
            price: resolved.price,
            duration: resolved.duration,
            quantity: item.quantity,
          });
        }

        const complimentaryNotes = record.includedItems
          .filter((item) => item.complimentary)
          .map((item) => `Complimentary: ${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ""}`);
        const description = [record.notes, ...complimentaryNotes].filter(Boolean).join(". ");
        const duration = Math.max(
          5,
          includedServices.length
            ? computePackageDuration(includedServices)
            : DEFAULT_DURATION * Math.max(1, record.includedItems.length)
        );

        await tx.service.create({
          data: {
            salonId: options.salonId,
            name: record.name.trim(),
            description: description || null,
            duration,
            price: record.price,
            categoryId: category.id,
            sortOrder: nextOrder(category.id),
            catalogType: "PACKAGE",
            audience: record.audience,
            isStartingPrice: record.isStartingPrice,
            status: "ACTIVE",
            onlineBooking: true,
            inStoreBooking: true,
            pricingStrategy: "CUSTOM_PRICE",
            packageItems: links.length
              ? {
                  create: links,
                }
              : undefined,
          },
        });
        packagesCreated += 1;
      }

      const createdStandalone = createPayload.length;
      const createdInclusions = inclusionCreates.length;
      const categoriesCreated = neededCategories.size;

      const importRow = await tx.serviceMenuImport.create({
        data: {
          salonId: options.salonId,
          uploadedById: options.userId,
          filename: options.filename,
          fileType: options.fileType,
          totalRecords: records.length,
          importedCount: createdStandalone + packagesCreated,
          skippedCount: skipped + problems.length,
          failedCount: problems.length,
          warningCount: problems.length,
          categoriesCreated,
          packagesCreated,
          servicesCreated: createdStandalone + createdInclusions,
          servicesReused,
          summary: {
            updated,
            problems,
          } as Prisma.InputJsonValue,
        },
      });

      return {
        importId: importRow.id,
        servicesCreated: createdStandalone + createdInclusions,
        packagesCreated,
        categoriesCreated,
        servicesReused,
        duplicatesSkipped: skipped,
        skipped: skipped + problems.length,
        failed: problems.length,
        warnings: problems.map((problem) => `${problem.name}: ${problem.reason}`),
        problems,
      } satisfies ImportCommitResult;
    },
    { timeout: 120_000, maxWait: 15_000 }
  );

  return result;
}
