import type { FaceShape, HairGenderCategory } from "@/generated/prisma/client";

export type FaceAnalysisResult = {
  valid: boolean;
  error?: string;
  faceShape?: FaceShape;
  confidence?: number;
  landmarks?: { x: number; y: number }[];
  faceBox?: { x: number; y: number; width: number; height: number };
  headBox?: { x: number; y: number; width: number; height: number };
  multipleFaces?: boolean;
};

export type HairstyleRecommendation = {
  hairstyleId: string;
  name: string;
  matchScore: number;
  reason: string;
};

export type PreviewGenerationInput = {
  consultationId: string;
  originalImagePath: string;
  hairstyleId: string;
  hairColorId?: string;
  faceAnalysis: FaceAnalysisResult;
  aiPromptInstructions?: string;
};

export type PreviewGenerationResult = {
  success: boolean;
  previewImageBase64?: string;
  previewStoragePath?: string;
  provider: string;
  error?: string;
};

export type AnalyzeFaceInput = {
  imageBase64: string;
  landmarks?: { x: number; y: number }[];
  faceBox?: { x: number; y: number; width: number; height: number };
};

export { type FaceShape, type HairGenderCategory };
