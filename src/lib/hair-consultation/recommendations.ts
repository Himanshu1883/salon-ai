import type { FaceShape, Hairstyle } from "@/generated/prisma/client";
import type { HairstyleRecommendation } from "./types";
import { getEffectiveFaceShape } from "./face-shape";

type HairstyleWithCategory = Hairstyle & {
  category?: { name: string } | null;
};

export function recommendHairstyles(
  hairstyles: HairstyleWithCategory[],
  faceShape: FaceShape | null,
  limit = 8
): HairstyleRecommendation[] {
  const scored = hairstyles
    .filter((h) => h.isActive)
    .map((style) => {
      let matchScore = 0.65;

      if (faceShape && style.suitableFaceShapes.length > 0) {
        if (style.suitableFaceShapes.includes(faceShape)) {
          matchScore = 0.92;
        } else {
          matchScore = 0.55;
        }
      }

      if (style.isRecommended) matchScore += 0.05;
      if (style.isTrending) matchScore += 0.03;

      matchScore = Math.min(0.98, matchScore);

      const reason =
        faceShape && style.suitableFaceShapes.includes(faceShape)
          ? `Recommended based on ${faceShape.toLowerCase()} face shape`
          : "Popular salon style";

      return {
        hairstyleId: style.id,
        name: style.name,
        matchScore: Math.round(matchScore * 100),
        reason,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return scored.slice(0, limit);
}

export function filterHairstylesByQuery(
  hairstyles: HairstyleWithCategory[],
  query: string
): HairstyleWithCategory[] {
  const q = query.trim().toLowerCase();
  if (!q) return hairstyles;
  return hairstyles.filter(
    (h) =>
      h.name.toLowerCase().includes(q) ||
      h.description?.toLowerCase().includes(q) ||
      h.category?.name.toLowerCase().includes(q) ||
      h.hairLength?.toLowerCase().includes(q)
  );
}

export function getRecommendedForConsultation(
  hairstyles: HairstyleWithCategory[],
  detected?: FaceShape | null,
  override?: FaceShape | null
) {
  const shape = getEffectiveFaceShape(detected, override);
  return recommendHairstyles(hairstyles, shape);
}
