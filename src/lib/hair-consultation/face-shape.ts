import type { FaceShape } from "@/generated/prisma/client";
import type { FaceAnalysisResult } from "./types";

/** Estimate face shape from normalized landmark ratios (client sends landmarks). */
export function estimateFaceShapeFromLandmarks(
  landmarks: { x: number; y: number }[],
  imageWidth: number,
  imageHeight: number
): Pick<FaceAnalysisResult, "faceShape" | "confidence" | "valid" | "error"> {
  if (landmarks.length < 68) {
    return { valid: false, error: "Insufficient facial landmarks detected." };
  }

  const xs = landmarks.map((p) => p.x * imageWidth);
  const ys = landmarks.map((p) => p.y * imageHeight);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const faceWidth = maxX - minX;
  const faceHeight = maxY - minY;

  if (faceWidth < 40 || faceHeight < 40) {
    return {
      valid: false,
      error: "Please move slightly closer so your entire head is visible.",
    };
  }

  const ratio = faceHeight / faceWidth;

  // Jaw width vs forehead (approx indices from 68-point model)
  const jawLeft = xs[0];
  const jawRight = xs[16];
  const browLeft = xs[17];
  const browRight = xs[26];
  const jawWidth = jawRight - jawLeft;
  const browWidth = browRight - browLeft;
  const jawToBrow = jawWidth / (browWidth || 1);

  let faceShape: FaceShape = "OVAL";
  let confidence = 0.75;

  if (ratio < 1.15 && jawToBrow > 0.95) {
    faceShape = "ROUND";
    confidence = 0.82;
  } else if (ratio > 1.45) {
    faceShape = "OBLONG";
    confidence = 0.8;
  } else if (jawToBrow > 1.05 && ratio < 1.35) {
    faceShape = "SQUARE";
    confidence = 0.78;
  } else if (jawToBrow < 0.88) {
    faceShape = "HEART";
    confidence = 0.76;
  } else if (ratio >= 1.15 && ratio <= 1.45) {
    faceShape = "OVAL";
    confidence = 0.85;
  } else {
    faceShape = "DIAMOND";
    confidence = 0.7;
  }

  return { valid: true, faceShape, confidence };
}

export function getEffectiveFaceShape(
  detected?: FaceShape | null,
  override?: FaceShape | null
): FaceShape | null {
  return override ?? detected ?? null;
}

export const FACE_SHAPE_LABELS: Record<FaceShape, string> = {
  OVAL: "Oval",
  ROUND: "Round",
  SQUARE: "Square",
  OBLONG: "Rectangle / Oblong",
  HEART: "Heart",
  DIAMOND: "Diamond",
};
