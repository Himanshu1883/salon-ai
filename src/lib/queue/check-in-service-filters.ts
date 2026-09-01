export const CHECK_IN_TOP_CATEGORIES = [
  "Hair",
  "Styling",
  "Color",
  "Facial",
  "Nails",
  "Spa",
  "Wax",
  "Packages",
] as const;

export type CheckInTopCategory = (typeof CHECK_IN_TOP_CATEGORIES)[number];

const TOP_RULES: Record<CheckInTopCategory, RegExp> = {
  Hair:
    /hair|blow\s?dry|rebond|smoothen|head\s*wash|beard|trimm|cut\s*&\s*styling|chemical/i,
  Styling:
    /styling|blow\s?dry|cut\s*&\s*styling|make\s?up|engagement|^bridal$|groom\s*makeup/i,
  Color: /colou?r|highlight|balayage/i,
  Facial:
    /facial|clean\s*up|bleach|d[-\s]?tan|thread|face\s*wax|eyebrow|lash/i,
  Nails: /nail|manicure|pedicure/i,
  Spa: /spa|massage|body\s*polish/i,
  Wax: /wax/i,
  Packages:
    /\bcombo\b|\bpackages?\b|pre[-\s]?bridal|groom\s+\d*\s*day/i,
};

export function categoryMatchesTop(name: string, top: string): boolean {
  const rule = TOP_RULES[top as CheckInTopCategory];
  if (!rule) return false;
  return rule.test(name.trim());
}

export function matchingCategoryIds(
  categories: { id: string; name: string }[],
  top: string
): string[] {
  return categories
    .filter((category) => categoryMatchesTop(category.name, top))
    .map((category) => category.id);
}

export function visibleTopCategories(
  categories: { name: string }[]
): CheckInTopCategory[] {
  return CHECK_IN_TOP_CATEGORIES.filter((top) =>
    categories.some((category) => categoryMatchesTop(category.name, top))
  );
}
