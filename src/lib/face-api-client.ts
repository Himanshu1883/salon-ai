"use client";

import type * as FaceApi from "@vladmandic/face-api";

export const FACE_MODELS_PATH = "/models";

let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const faceapi = await import("@vladmandic/face-api");
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODELS_PATH),
      faceapi.nets.faceLandmark68Net.loadFromUri(FACE_MODELS_PATH),
      faceapi.nets.faceRecognitionNet.loadFromUri(FACE_MODELS_PATH),
    ]);
    modelsLoaded = true;
  })();

  return loadingPromise;
}

export async function getFaceApi(): Promise<typeof FaceApi> {
  return import("@vladmandic/face-api");
}

export async function detectFaceDescriptor(
  videoOrCanvas: HTMLVideoElement | HTMLCanvasElement
): Promise<Float32Array | null> {
  const faceapi = await getFaceApi();
  await loadFaceModels();

  const detection = await faceapi
    .detectSingleFace(videoOrCanvas, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection?.descriptor ?? null;
}

export function descriptorToArray(descriptor: Float32Array): number[] {
  return Array.from(descriptor);
}
