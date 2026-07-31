import type { PrismaClient } from "@/generated/prisma/client";
import { RESERVED_SALON_SLUGS } from "@/lib/salon-paths";

export function slugifySalonName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  if (!slug || RESERVED_SALON_SLUGS.has(slug)) {
    return "salon";
  }

  return slug;
}

export async function generateUniqueSalonSlug(
  name: string,
  prisma: Pick<PrismaClient, "salon">,
  excludeSalonId?: string
): Promise<string> {
  const base = slugifySalonName(name);
  let slug = base;
  let suffix = 2;

  while (true) {
    const existing = await prisma.salon.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === excludeSalonId) {
      return slug;
    }

    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}
