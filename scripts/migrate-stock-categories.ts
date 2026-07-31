import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { DEFAULT_STOCK_CATEGORY_NAMES } from "../src/lib/stock-categories";

const prisma = createPrismaClient();

async function getOrCreateCategory(
  salonId: string,
  name: string,
  sortOrder: number,
  cache: Map<string, string>
) {
  const key = `${salonId}:${name.toLowerCase()}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const existing = await prisma.stockCategory.findFirst({
    where: { salonId, name },
  });
  if (existing) {
    cache.set(key, existing.id);
    return existing.id;
  }

  const created = await prisma.stockCategory.create({
    data: { salonId, name, sortOrder },
  });
  cache.set(key, created.id);
  return created.id;
}

async function main() {
  const salons = await prisma.salon.findMany({ select: { id: true } });
  const categoryCache = new Map<string, string>();

  for (const salon of salons) {
    let sortOrder = 0;
    for (const name of DEFAULT_STOCK_CATEGORY_NAMES) {
      await getOrCreateCategory(salon.id, name, sortOrder++, categoryCache);
    }

    const items = await prisma.$queryRaw<
      Array<{ id: string; salonId: string; category: string | null; categoryId: string | null }>
    >`SELECT id, salonId, category, categoryId FROM StockItem WHERE salonId = ${salon.id}`;

    for (const item of items) {
      if (item.categoryId) continue;

      const legacyName = item.category?.trim() || "other";
      const normalized =
        DEFAULT_STOCK_CATEGORY_NAMES.find(
          (name) => name.toLowerCase() === legacyName.toLowerCase()
        ) ?? legacyName;

      const categoryId = await getOrCreateCategory(
        salon.id,
        normalized,
        sortOrder++,
        categoryCache
      );

      await prisma.stockItem.update({
        where: { id: item.id },
        data: { categoryId },
      });
    }

    console.log(`Salon ${salon.id}: migrated stock categories`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
