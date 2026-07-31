/** Euclidean distance between two 128-d face descriptors. Lower = better match. */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Descriptor length mismatch");
  }
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export const FACE_MATCH_THRESHOLD = 0.6;

export type FaceMatchResult = {
  employeeId: string;
  employeeName: string;
  distance: number;
  confidence: number;
};

export function findBestFaceMatch(
  descriptor: number[],
  profiles: { employeeId: string; employeeName: string; faceDescriptor: number[] }[],
  threshold = FACE_MATCH_THRESHOLD
): FaceMatchResult | null {
  let best: FaceMatchResult | null = null;

  for (const profile of profiles) {
    const distance = euclideanDistance(descriptor, profile.faceDescriptor);
    if (distance <= threshold && (!best || distance < best.distance)) {
      best = {
        employeeId: profile.employeeId,
        employeeName: profile.employeeName,
        distance,
        confidence: Math.max(0, 1 - distance / threshold),
      };
    }
  }

  return best;
}

export function parseDescriptorJson(json: string): number[] {
  const parsed = JSON.parse(json) as unknown;
  if (!Array.isArray(parsed) || parsed.length !== 128) {
    throw new Error("Invalid face descriptor");
  }
  return parsed.map(Number);
}
