"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { canHairConsultation } from "@/lib/hair-consultation/permissions";
import type { FaceShape, HairGenderCategory } from "@/generated/prisma/client";
import { saveConsultationPhoto, consultationPhotoUrl } from "@/lib/hair-consultation/consultation-upload";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function getHairstyles(filters?: {
  gender?: HairGenderCategory;
  search?: string;
  categoryId?: string;
}) {
  const session = await requireSession();
  const salonId = session.user.salonId!;

  const hairstyles = await prisma.hairstyle.findMany({
    where: {
      isActive: true,
      OR: [{ salonId: null }, { salonId }],
      ...(filters?.gender ? { genderCategory: filters.gender } : {}),
      ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters?.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: "insensitive" } },
              { description: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return {
    success: true,
    hairstyles: hairstyles.map((h) => ({
      ...h,
      thumbnailUrl: h.thumbnailPath
        ? consultationPhotoUrl(h.thumbnailPath)
        : null,
      previewUrl: h.previewImagePath
        ? consultationPhotoUrl(h.previewImagePath)
        : null,
    })),
  };
}

export async function getHairstyleCategories() {
  const session = await requireSession();
  const salonId = session.user.salonId!;

  const categories = await prisma.hairstyleCategory.findMany({
    where: {
      isActive: true,
      OR: [{ salonId: null }, { salonId }],
    },
    orderBy: { sortOrder: "asc" },
  });

  return { success: true, categories };
}

export async function getHairColors() {
  const session = await requireSession();
  const salonId = session.user.salonId!;

  const colors = await prisma.hairColor.findMany({
    where: {
      isActive: true,
      OR: [{ salonId: null }, { salonId }],
    },
    orderBy: { sortOrder: "asc" },
  });

  return { success: true, colors };
}

export async function upsertHairstyle(formData: FormData) {
  const session = await requireSession();
  if (!canHairConsultation(session.user, "manage_styles")) {
    return { error: "Permission denied" };
  }
  const salonId = session.user.salonId!;
  const id = formData.get("id") as string | null;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required" };

  const suitableFaceShapes = (formData.get("suitableFaceShapes") as string)
    ?.split(",")
    .filter(Boolean) as FaceShape[];

  const data = {
    salonId,
    name,
    description: String(formData.get("description") ?? "") || null,
    categoryId: (formData.get("categoryId") as string) || null,
    serviceId: (formData.get("serviceId") as string) || null,
    hairLength: String(formData.get("hairLength") ?? "") || null,
    hairType: String(formData.get("hairType") ?? "") || null,
    genderCategory: (formData.get("genderCategory") as HairGenderCategory) || "UNISEX",
    suitableFaceShapes,
    price: formData.get("price") ? Number(formData.get("price")) : null,
    serviceDuration: formData.get("serviceDuration")
      ? Number(formData.get("serviceDuration"))
      : null,
    aiPromptInstructions: String(formData.get("aiPromptInstructions") ?? "") || null,
    isRecommended: formData.get("isRecommended") === "true",
    isTrending: formData.get("isTrending") === "true",
    isActive: formData.get("isActive") !== "false",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  };

  if (id) {
    await prisma.hairstyle.updateMany({ where: { id, salonId }, data });
  } else {
    await prisma.hairstyle.create({ data });
  }

  revalidatePath("/hair-consultation/admin");
  return { success: true };
}

export async function seedDefaultHairstylesForSalon() {
  const session = await requireSession();
  const salonId = session.user.salonId!;

  const existing = await prisma.hairstyle.count({
    where: { OR: [{ salonId: null }, { salonId }] },
  });
  if (existing > 0) {
    return { success: true, message: "Hairstyles already seeded" };
  }

  const menCat = await prisma.hairstyleCategory.create({
    data: { salonId, name: "Men — Short", genderCategory: "MEN", sortOrder: 1 },
  });
  const fadeCat = await prisma.hairstyleCategory.create({
    data: { salonId, name: "Fade", genderCategory: "MEN", sortOrder: 2 },
  });
  const womenCat = await prisma.hairstyleCategory.create({
    data: { salonId, name: "Women", genderCategory: "WOMEN", sortOrder: 3 },
  });

  const defaults: {
    name: string;
    categoryId: string;
    gender: HairGenderCategory;
    shapes: FaceShape[];
    length: string;
    trending?: boolean;
    recommended?: boolean;
  }[] = [
    { name: "Textured Crop", categoryId: menCat.id, gender: "MEN", shapes: ["OVAL", "SQUARE", "ROUND"], length: "Short", recommended: true },
    { name: "Low Fade", categoryId: fadeCat.id, gender: "MEN", shapes: ["OVAL", "SQUARE"], length: "Short", trending: true },
    { name: "Side Part", categoryId: menCat.id, gender: "MEN", shapes: ["OVAL", "OBLONG"], length: "Medium" },
    { name: "French Crop", categoryId: menCat.id, gender: "MEN", shapes: ["OVAL", "ROUND"], length: "Short" },
    { name: "Pompadour", categoryId: menCat.id, gender: "MEN", shapes: ["OVAL", "SQUARE"], length: "Medium" },
    { name: "Buzz Cut", categoryId: menCat.id, gender: "MEN", shapes: ["OVAL", "SQUARE", "ROUND"], length: "Short" },
    { name: "Bob", categoryId: womenCat.id, gender: "WOMEN", shapes: ["OVAL", "HEART"], length: "Medium", recommended: true },
    { name: "Layer Cut", categoryId: womenCat.id, gender: "WOMEN", shapes: ["OVAL", "ROUND"], length: "Long" },
    { name: "Pixie", categoryId: womenCat.id, gender: "WOMEN", shapes: ["OVAL", "HEART"], length: "Short" },
    { name: "Wolf Cut", categoryId: womenCat.id, gender: "WOMEN", shapes: ["OVAL", "DIAMOND"], length: "Medium", trending: true },
  ];

  await prisma.hairstyle.createMany({
    data: defaults.map((d, i) => ({
      salonId,
      categoryId: d.categoryId,
      name: d.name,
      genderCategory: d.gender,
      suitableFaceShapes: d.shapes,
      hairLength: d.length,
      isRecommended: d.recommended ?? false,
      isTrending: d.trending ?? false,
      sortOrder: i,
    })),
  });

  const colors = [
    { name: "Natural Black", hex: "#1a1a1a" },
    { name: "Dark Brown", hex: "#3d2314" },
    { name: "Light Brown", hex: "#8b5a2b" },
    { name: "Ash Brown", hex: "#6b5344" },
    { name: "Blonde", hex: "#d4a76a" },
    { name: "Burgundy", hex: "#722f37" },
  ];
  await prisma.hairColor.createMany({
    data: colors.map((c, i) => ({
      salonId,
      name: c.name,
      hexColor: c.hex,
      sortOrder: i,
    })),
  });

  return { success: true };
}

export async function saveHairstyleThumbnail(formData: FormData) {
  const session = await requireSession();
  if (!canHairConsultation(session.user, "manage_styles")) {
    return { error: "Permission denied" };
  }
  const salonId = session.user.salonId!;
  const hairstyleId = String(formData.get("hairstyleId") ?? "");
  const file = formData.get("file") as File | null;
  if (!hairstyleId || !file) return { error: "Missing data" };

  const ext = file.type === "image/png" ? ".png" : ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const relativeDir = path.join("hairstyles", salonId);
  const absoluteDir = path.join(process.cwd(), "uploads", relativeDir);
  await mkdir(absoluteDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(absoluteDir, filename), buffer);
  const storagePath = path.join(relativeDir, filename).replace(/\\/g, "/");

  await prisma.hairstyle.updateMany({
    where: { id: hairstyleId, salonId },
    data: { thumbnailPath: storagePath },
  });

  return { success: true, url: consultationPhotoUrl(storagePath) };
}
