"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { canHairConsultation } from "@/lib/hair-consultation/permissions";
import {
  saveConsultationPhoto,
  saveConsultationPhotoBase64,
  consultationPhotoUrl,
} from "@/lib/hair-consultation/consultation-upload";
import { getAIHairTryOnService } from "@/lib/hair-consultation/ai-hair-try-on-service";
import { getRecommendedForConsultation } from "@/lib/hair-consultation/recommendations";
import { getEffectiveFaceShape } from "@/lib/hair-consultation/face-shape";
import type { FaceShape } from "@/generated/prisma/client";

async function getConsultationOrError(id: string, salonId: string) {
  const consultation = await prisma.hairConsultation.findFirst({
    where: { id, salonId },
    include: {
      customer: true,
      employee: true,
      service: true,
      photos: true,
      selections: { include: { hairstyle: true, hairColor: true, previewPhoto: true } },
      selectedHairstyle: true,
      selectedHairColor: true,
    },
  });
  if (!consultation) return { error: "Consultation not found" as const };
  return { consultation };
}

export async function createHairConsultation(input: {
  customerId: string;
  serviceId?: string;
  employeeId?: string;
  branchId?: string;
}) {
  const session = await requireSession();
  if (!canHairConsultation(session.user, "create")) {
    return { error: "You do not have permission to create consultations." };
  }
  const salonId = session.user.salonId!;

  const customer = await prisma.customer.findFirst({
    where: { id: input.customerId, salonId },
  });
  if (!customer) return { error: "Customer not found" };

  let servicePrice: number | undefined;
  let serviceDuration: number | undefined;
  if (input.serviceId) {
    const service = await prisma.service.findFirst({
      where: { id: input.serviceId, salonId },
    });
    if (service) {
      servicePrice = service.price;
      serviceDuration = service.duration;
    }
  }

  await prisma.hairConsultationSettings.upsert({
    where: { salonId },
    create: { salonId },
    update: {},
  });

  const consultation = await prisma.hairConsultation.create({
    data: {
      salonId,
      customerId: input.customerId,
      serviceId: input.serviceId,
      employeeId: input.employeeId,
      branchId: input.branchId,
      servicePrice,
      serviceDuration,
      status: "DRAFT",
    },
  });

  revalidatePath("/hair-consultation");
  revalidatePath(`/clients/${input.customerId}`);
  return { success: true, consultationId: consultation.id };
}

export async function uploadConsultationPhoto(formData: FormData) {
  const session = await requireSession();
  if (!canHairConsultation(session.user, "create")) {
    return { error: "Permission denied" };
  }
  const salonId = session.user.salonId!;
  const consultationId = String(formData.get("consultationId") ?? "");
  const photoType = String(formData.get("photoType") ?? "ORIGINAL");
  const file = formData.get("photo") as File | null;

  if (!consultationId || !file) return { error: "Missing consultation or photo" };

  const { consultation, error } = await getConsultationOrError(consultationId, salonId);
  if (error) return { error };

  const saved = await saveConsultationPhoto(
    file,
    salonId,
    consultation!.customerId,
    consultationId,
    photoType.toLowerCase()
  );
  if (saved.error) return { error: saved.error };

  const photo = await prisma.hairConsultationPhoto.create({
    data: {
      consultationId,
      type:
        photoType === "ACTUAL_RESULT"
          ? "ACTUAL_RESULT"
          : photoType === "PREVIEW"
            ? "PREVIEW"
            : "ORIGINAL",
      storagePath: saved.path!,
      mimeType: file.type || "image/jpeg",
    },
  });

  if (photoType === "ORIGINAL") {
    await prisma.hairConsultation.update({
      where: { id: consultationId },
      data: { status: "PHOTO_CAPTURED" },
    });
  }

  return {
    success: true,
    photoId: photo.id,
    url: consultationPhotoUrl(saved.path!),
  };
}

export async function analyzeConsultationFace(input: {
  consultationId: string;
  landmarks?: { x: number; y: number }[];
  faceBox?: { x: number; y: number; width: number; height: number };
  imageWidth?: number;
  imageHeight?: number;
}) {
  const session = await requireSession();
  const salonId = session.user.salonId!;
  const { consultation, error } = await getConsultationOrError(
    input.consultationId,
    salonId
  );
  if (error) return { error };

  const original = consultation!.photos.find((p) => p.type === "ORIGINAL");
  if (!original) return { error: "Upload a customer photo first." };

  const ai = getAIHairTryOnService();
  const analysis = await ai.analyzeFace({
    imageBase64: "",
    landmarks: input.landmarks,
    faceBox: input.faceBox,
  });

  if (!analysis.valid) {
    return { error: analysis.error ?? "Photo validation failed." };
  }

  const hairstyles = await prisma.hairstyle.findMany({
    where: {
      isActive: true,
      OR: [{ salonId: null }, { salonId }],
    },
    include: { category: true },
  });

  const recommendations = getRecommendedForConsultation(
    hairstyles,
    analysis.faceShape,
    null
  );

  await prisma.hairConsultation.update({
    where: { id: input.consultationId },
    data: {
      status: "ANALYZED",
      detectedFaceShape: analysis.faceShape,
      faceShapeConfidence: analysis.confidence,
      faceAnalysisJson: {
        landmarks: input.landmarks,
        faceBox: input.faceBox,
        imageWidth: input.imageWidth,
        imageHeight: input.imageHeight,
      },
      aiRecommendationsJson: recommendations,
    },
  });

  return {
    success: true,
    analysis,
    recommendations,
    originalPhotoUrl: consultationPhotoUrl(original.storagePath),
  };
}

export async function overrideConsultationFaceShape(
  consultationId: string,
  faceShape: FaceShape
) {
  const session = await requireSession();
  const salonId = session.user.salonId!;

  const updated = await prisma.hairConsultation.updateMany({
    where: { id: consultationId, salonId },
    data: { faceShapeOverride: faceShape },
  });
  if (!updated.count) return { error: "Consultation not found" };
  return { success: true };
}

export async function tryHairstyleOnConsultation(input: {
  consultationId: string;
  hairstyleId: string;
  hairColorId?: string;
  previewBase64?: string;
}) {
  const session = await requireSession();
  const salonId = session.user.salonId!;
  const { consultation, error } = await getConsultationOrError(
    input.consultationId,
    salonId
  );
  if (error) return { error };

  const hairstyle = await prisma.hairstyle.findFirst({
    where: {
      id: input.hairstyleId,
      isActive: true,
      OR: [{ salonId: null }, { salonId }],
    },
  });
  if (!hairstyle) return { error: "Hairstyle not found" };

  const original = consultation!.photos.find((p) => p.type === "ORIGINAL");
  if (!original) return { error: "Original photo required" };

  let previewPhotoId: string | undefined;
  let previewUrl: string | undefined;

  if (input.previewBase64) {
    const saved = await saveConsultationPhotoBase64(
      input.previewBase64,
      salonId,
      consultation!.customerId,
      input.consultationId,
      `preview-${input.hairstyleId}`
    );
    if (saved.path) {
      const photo = await prisma.hairConsultationPhoto.create({
        data: {
          consultationId: input.consultationId,
          type: "PREVIEW",
          storagePath: saved.path,
          mimeType: "image/png",
        },
      });
      previewPhotoId = photo.id;
      previewUrl = consultationPhotoUrl(saved.path);
    }
  } else {
    const ai = getAIHairTryOnService();
    const result = await ai.generateHairstylePreview({
      consultationId: input.consultationId,
      originalImagePath: original.storagePath,
      hairstyleId: input.hairstyleId,
      hairColorId: input.hairColorId,
      faceAnalysis: { valid: true },
      aiPromptInstructions: hairstyle.aiPromptInstructions ?? undefined,
    });

    if (result.previewImageBase64) {
      const saved = await saveConsultationPhotoBase64(
        result.previewImageBase64,
        salonId,
        consultation!.customerId,
        input.consultationId,
        `preview-${input.hairstyleId}`
      );
      if (saved.path) {
        const photo = await prisma.hairConsultationPhoto.create({
          data: {
            consultationId: input.consultationId,
            type: "PREVIEW",
            storagePath: saved.path,
            mimeType: "image/png",
            metadata: { provider: result.provider },
          },
        });
        previewPhotoId = photo.id;
        previewUrl = consultationPhotoUrl(saved.path);
      }
    }
  }

  const faceShape = getEffectiveFaceShape(
    consultation!.detectedFaceShape,
    consultation!.faceShapeOverride
  );
  const matchScore = faceShape && hairstyle.suitableFaceShapes.includes(faceShape) ? 95 : 75;

  const selection = await prisma.hairConsultationSelection.create({
    data: {
      consultationId: input.consultationId,
      hairstyleId: input.hairstyleId,
      hairColorId: input.hairColorId,
      previewPhotoId,
      matchScore,
    },
    include: { hairstyle: true, previewPhoto: true },
  });

  await prisma.hairConsultation.update({
    where: { id: input.consultationId },
    data: { status: "STYLES_TRIED" },
  });

  return {
    success: true,
    selection,
    previewUrl,
    originalUrl: consultationPhotoUrl(original.storagePath),
    provider: input.previewBase64 ? "client-composite" : "server",
  };
}

export async function selectCustomerHairstyle(
  consultationId: string,
  selectionId: string
) {
  const session = await requireSession();
  const salonId = session.user.salonId!;

  const selection = await prisma.hairConsultationSelection.findFirst({
    where: { id: selectionId, consultation: { id: consultationId, salonId } },
    include: { hairstyle: true, hairColor: true },
  });
  if (!selection) return { error: "Selection not found" };

  await prisma.hairConsultationSelection.updateMany({
    where: { consultationId },
    data: { isCustomerChoice: false },
  });
  await prisma.hairConsultationSelection.update({
    where: { id: selectionId },
    data: { isCustomerChoice: true },
  });

  await prisma.hairConsultation.update({
    where: { id: consultationId },
    data: {
      status: "STYLE_SELECTED",
      selectedHairstyleId: selection.hairstyleId,
      selectedHairColorId: selection.hairColorId,
      servicePrice: selection.hairstyle.price ?? undefined,
      serviceDuration: selection.hairstyle.serviceDuration ?? undefined,
      customerApproved: true,
      customerApprovedAt: new Date(),
    },
  });

  return { success: true };
}

export async function saveHairConsultation(input: {
  consultationId: string;
  notes?: string;
  complete?: boolean;
}) {
  const session = await requireSession();
  const salonId = session.user.salonId!;

  const data: {
    notes?: string;
    status?: "COMPLETED";
    completedAt?: Date;
  } = {};
  if (input.notes !== undefined) data.notes = input.notes;
  if (input.complete) {
    data.status = "COMPLETED";
    data.completedAt = new Date();
  }

  const updated = await prisma.hairConsultation.updateMany({
    where: { id: input.consultationId, salonId },
    data,
  });
  if (!updated.count) return { error: "Consultation not found" };

  revalidatePath("/hair-consultation");
  return { success: true };
}

export async function saveConsultationFeedback(input: {
  consultationId: string;
  rating: number;
  wouldChooseAgain: boolean;
  comment?: string;
}) {
  const session = await requireSession();
  const salonId = session.user.salonId!;

  const consultation = await prisma.hairConsultation.findFirst({
    where: { id: input.consultationId, salonId },
  });
  if (!consultation) return { error: "Consultation not found" };

  await prisma.hairConsultationFeedback.upsert({
    where: { consultationId: input.consultationId },
    create: {
      consultationId: input.consultationId,
      rating: input.rating,
      wouldChooseAgain: input.wouldChooseAgain,
      comment: input.comment,
    },
    update: {
      rating: input.rating,
      wouldChooseAgain: input.wouldChooseAgain,
      comment: input.comment,
    },
  });

  await prisma.hairConsultation.update({
    where: { id: input.consultationId },
    data: {
      satisfactionRating: input.rating,
      wouldChooseAgain: input.wouldChooseAgain,
    },
  });

  return { success: true };
}

export async function getHairConsultation(id: string) {
  const session = await requireSession();
  const salonId = session.user.salonId!;
  const { consultation, error } = await getConsultationOrError(id, salonId);
  if (error) return { error };

  const settings = await prisma.hairConsultationSettings.findUnique({
    where: { salonId },
  });

  return {
    success: true,
    consultation: {
      ...consultation!,
      photos: consultation!.photos.map((p) => ({
        ...p,
        url: consultationPhotoUrl(p.storagePath),
      })),
    },
    disclaimer: settings?.disclaimer,
  };
}

export async function getCustomerHairConsultations(customerId: string) {
  const session = await requireSession();
  const salonId = session.user.salonId!;

  const list = await prisma.hairConsultation.findMany({
    where: { customerId, salonId },
    orderBy: { createdAt: "desc" },
    include: {
      selectedHairstyle: true,
      service: true,
      employee: true,
      photos: { where: { type: { in: ["ORIGINAL", "PREVIEW", "ACTUAL_RESULT"] } } },
    },
  });

  return {
    success: true,
    consultations: list.map((c) => ({
      ...c,
      photos: c.photos.map((p) => ({
        ...p,
        url: consultationPhotoUrl(p.storagePath),
      })),
    })),
  };
}

export async function getHairConsultationAnalytics() {
  const session = await requireSession();
  if (!canHairConsultation(session.user, "view_analytics")) {
    return { error: "Permission denied" };
  }
  const salonId = session.user.salonId!;

  const [total, selections, approved] = await Promise.all([
    prisma.hairConsultation.count({ where: { salonId } }),
    prisma.hairConsultationSelection.groupBy({
      by: ["hairstyleId"],
      where: { consultation: { salonId } },
      _count: { hairstyleId: true },
      orderBy: { _count: { hairstyleId: "desc" } },
      take: 10,
    }),
    prisma.hairConsultation.count({
      where: { salonId, customerApproved: true },
    }),
  ]);

  const hairstyleIds = selections.map((s) => s.hairstyleId);
  const hairstyles = await prisma.hairstyle.findMany({
    where: { id: { in: hairstyleIds } },
  });
  const nameById = Object.fromEntries(hairstyles.map((h) => [h.id, h.name]));

  return {
    success: true,
    analytics: {
      totalConsultations: total,
      approvalRate: total ? Math.round((approved / total) * 100) : 0,
      topHairstyles: selections.map((s) => ({
        name: nameById[s.hairstyleId] ?? "Unknown",
        count: s._count.hairstyleId,
      })),
    },
  };
}
