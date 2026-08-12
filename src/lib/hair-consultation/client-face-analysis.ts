"use client";

import type { FaceShape } from "@/generated/prisma/client";
import {
  detectFaceDescriptor,
  getFaceApi,
  loadFaceModels,
} from "@/lib/face-api-client";
import { estimateFaceShapeFromLandmarks } from "@/lib/hair-consultation/face-shape";

export type ClientFaceCaptureResult = {
  valid: boolean;
  error?: string;
  imageDataUrl?: string;
  landmarks?: { x: number; y: number }[];
  faceBox?: { x: number; y: number; width: number; height: number };
  faceShape?: FaceShape;
  confidence?: number;
  width: number;
  height: number;
};

export async function captureAndAnalyzePhoto(
  video: HTMLVideoElement
): Promise<ClientFaceCaptureResult> {
  const faceapi = await getFaceApi();
  await loadFaceModels();

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { valid: false, error: "Canvas unavailable", width: 0, height: 0 };

  ctx.drawImage(video, 0, 0);
  const width = canvas.width;
  const height = canvas.height;

  const detections = await faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks();

  if (detections.length === 0) {
    return {
      valid: false,
      error: "Please look straight at the camera.",
      width,
      height,
    };
  }

  if (detections.length > 1) {
    return {
      valid: false,
      error: "Multiple faces detected. Only one person should be in the photo.",
      width,
      height,
    };
  }

  const detection = detections[0];
  const box = detection.detection.box;
  const landmarks = detection.landmarks.positions.map((p) => ({
    x: p.x / width,
    y: p.y / height,
  }));

  const headVisible = box.y > 0 && box.y + box.height < height * 0.95;
  if (!headVisible || box.height / height < 0.25) {
    return {
      valid: false,
      error: "Please take another photo with the complete head visible.",
      width,
      height,
    };
  }

  const shapeResult = estimateFaceShapeFromLandmarks(landmarks, width, height);

  return {
    valid: shapeResult.valid,
    error: shapeResult.error,
    imageDataUrl: canvas.toDataURL("image/jpeg", 0.92),
    landmarks,
    faceBox: {
      x: box.x / width,
      y: box.y / height,
      width: box.width / width,
      height: box.height / height,
    },
    faceShape: shapeResult.faceShape,
    confidence: shapeResult.confidence,
    width,
    height,
  };
}

export async function compositeHairstylePreview(
  originalDataUrl: string,
  hairstyleImageUrl: string | null,
  faceBox: { x: number; y: number; width: number; height: number },
  hairColorHex?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas error"));
        return;
      }
      ctx.drawImage(img, 0, 0);

      if (hairstyleImageUrl) {
        const overlay = new Image();
        overlay.crossOrigin = "anonymous";
        overlay.onload = () => {
          const hx = faceBox.x * img.width - faceBox.width * img.width * 0.35;
          const hy = faceBox.y * img.height - faceBox.height * img.height * 0.55;
          const hw = faceBox.width * img.width * 1.7;
          const hh = faceBox.height * img.height * 1.1;
          ctx.globalAlpha = 0.88;
          ctx.drawImage(overlay, hx, hy, hw, hh);
          ctx.globalAlpha = 1;
          if (hairColorHex) {
            ctx.globalCompositeOperation = "color";
            ctx.fillStyle = hairColorHex;
            ctx.fillRect(hx, hy, hw, hh * 0.85);
            ctx.globalCompositeOperation = "source-over";
          }
          resolve(canvas.toDataURL("image/png"));
        };
        overlay.onerror = () => resolve(canvas.toDataURL("image/png"));
        overlay.src = hairstyleImageUrl;
      } else {
        resolve(canvas.toDataURL("image/png"));
      }
    };
    img.onerror = () => reject(new Error("Failed to load photo"));
    img.src = originalDataUrl;
  });
}
