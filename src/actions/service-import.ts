"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAnyPermission } from "@/lib/permissions/require";
import { scheduleSalonCacheRevalidation } from "@/lib/salon-cache";
import {
  analyzePriceList,
  CSV_TEMPLATE,
  ImportFileError,
  validateImportFile,
  type ColumnMapping,
  type CommitImportRecord,
} from "@/lib/catalog-import";
import { commitServiceMenuImport } from "@/lib/catalog-import/importer";
import { IMPORT_AUDIENCES } from "@/lib/catalog-import/types";

const mappingSchema = z
  .object({
    audience: z.string().optional(),
    category: z.string().optional(),
    name: z.string().optional(),
    price: z.string().optional(),
    notes: z.string().optional(),
  })
  .optional();

const commitRecordSchema = z.object({
  id: z.string(),
  action: z.enum(["CREATE", "SKIP", "UPDATE"]),
  audience: z.enum(IMPORT_AUDIENCES).nullable(),
  category: z.string(),
  name: z.string(),
  type: z.enum(["SERVICE", "PACKAGE"]),
  price: z.number().nullable(),
  isStartingPrice: z.boolean(),
  notes: z.string(),
  includedItems: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().int().min(1),
      complimentary: z.boolean(),
      unitPrice: z.number().nullable(),
      originalText: z.string(),
    })
  ),
  existingServiceId: z.string().optional(),
});

function actionError(err: unknown, fallback: string) {
  if (err instanceof ImportFileError) return { error: err.message };
  if (err instanceof Error && err.message === "Unauthorized") {
    return { error: "Your session expired. Please sign in again." };
  }
  if (err instanceof Error && err.message.startsWith("Forbidden")) {
    return { error: "You do not have permission to import services." };
  }
  console.error(fallback, err);
  return { error: fallback };
}

export async function getServiceMenuCsvTemplate() {
  await requireAnyPermission(["services.import", "services.create"]);
  return { csv: CSV_TEMPLATE };
}

export async function analyzeServiceMenuFile(
  formData: FormData,
  mapping?: ColumnMapping
) {
  try {
    const session = await requireAnyPermission([
      "services.import",
      "services.create",
    ]);
    const salonId = session.user.salonId!;
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { error: "Choose a CSV, Excel, or PDF file to import." };
    }

    const { filename, fileType } = validateImportFile({
      name: file.name,
      type: file.type,
      size: file.size,
    });
    const parsedMapping = mappingSchema.safeParse(mapping);
    if (!parsedMapping.success) {
      return { error: "Column mapping is invalid." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const existing = await prisma.service.findMany({
      where: { salonId },
      select: {
        id: true,
        name: true,
        audience: true,
        price: true,
        catalogType: true,
        category: { select: { name: true } },
      },
    });

    const analyzed = await analyzePriceList({
      buffer,
      filename,
      fileType,
      salonName: session.user.salonName ?? "your salon",
      existing: existing.map((service) => ({
        id: service.id,
        name: service.name,
        categoryName: service.category?.name ?? null,
        audience: service.audience,
        price: service.price,
        catalogType: service.catalogType,
      })),
      mapping: parsedMapping.data,
    });

    return { success: true as const, ...analyzed };
  } catch (err) {
    return actionError(err, "File could not be parsed. Check the format and try again.");
  }
}

export async function commitServiceMenuImportAction(input: {
  filename: string;
  fileType: string;
  records: CommitImportRecord[];
}) {
  try {
    const session = await requireAnyPermission([
      "services.import",
      "services.create",
    ]);
    const salonId = session.user.salonId!;
    const parsed = z
      .object({
        filename: z.string().min(1).max(180),
        fileType: z.enum(["csv", "xlsx", "pdf"]),
        records: z.array(commitRecordSchema).max(5000),
      })
      .safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid import payload." };
    }

    const result = await commitServiceMenuImport({
      salonId,
      userId: session.user.id,
      filename: parsed.data.filename,
      fileType: parsed.data.fileType,
      records: parsed.data.records,
    });

    scheduleSalonCacheRevalidation(
      salonId,
      "catalog",
      "catalog-options",
      "check-in",
      "billing"
    );
    return { success: true as const, result };
  } catch (err) {
    return actionError(
      err,
      "Import failed before saving. No catalog changes were applied."
    );
  }
}
