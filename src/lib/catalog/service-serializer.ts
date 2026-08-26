import {
  computePackageItemsTotal,
  resolvePackagePrice,
} from "@/lib/catalog/package-pricing";

export const catalogInclude = {
  category: true,
  employees: { include: { employee: true } },
  packageItems: {
    include: {
      includedService: {
        select: { id: true, name: true, price: true, duration: true },
      },
    },
    orderBy: { sortOrder: "asc" as const },
  },
  parentAddOnLinks: {
    include: {
      addOnService: {
        select: {
          id: true,
          name: true,
          price: true,
          duration: true,
          status: true,
        },
      },
    },
    orderBy: { sortOrder: "asc" as const },
  },
  addOnParentLinks: {
    include: {
      parentService: { select: { id: true, name: true } },
    },
    orderBy: { sortOrder: "asc" as const },
  },
} as const;

/** Lighter include for service menu list — skips add-on parent reverse links. */
export const catalogListInclude = {
  category: { select: { id: true, name: true, categoryGroup: true } },
  employees: { include: { employee: { select: { id: true, name: true } } } },
  packageItems: {
    include: {
      includedService: {
        select: { id: true, name: true, price: true, duration: true },
      },
    },
    orderBy: { sortOrder: "asc" as const },
  },
  parentAddOnLinks: {
    include: {
      addOnService: {
        select: {
          id: true,
          name: true,
          price: true,
          duration: true,
          status: true,
        },
      },
    },
    orderBy: { sortOrder: "asc" as const },
  },
} as const;

/** Lighter include for service CRUD — skips empty package/add-on parent relations. */
export const catalogServiceInclude = {
  category: true,
  employees: { include: { employee: true } },
  parentAddOnLinks: {
    include: {
      addOnService: {
        select: {
          id: true,
          name: true,
          price: true,
          duration: true,
          status: true,
        },
      },
    },
    orderBy: { sortOrder: "asc" as const },
  },
} as const;

export function serializeCatalogItem(service: {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  categoryId: string | null;
  sortOrder: number;
  catalogType: string;
  audience: string;
  status: string;
  onlineBooking: boolean;
  inStoreBooking: boolean;
  pricingStrategy: string | null;
  discountPercent: number | null;
  discountAmount: number | null;
  employees: { employee: { id: string; name: string } }[];
  packageItems?: {
    id: string;
    sortOrder: number;
    quantity: number;
    includedService: {
      id: string;
      name: string;
      price: number;
      duration: number;
    };
  }[];
  parentAddOnLinks?: {
    id: string;
    sortOrder: number;
    addOnService: {
      id: string;
      name: string;
      price: number;
      duration: number;
      status: string;
    };
  }[];
  addOnParentLinks?: {
    id: string;
    sortOrder: number;
    parentService: { id: string; name: string };
  }[];
  category?: { id: string; name: string; categoryGroup?: string } | null;
}) {
  const itemsTotal =
    service.catalogType === "PACKAGE" && service.packageItems?.length
      ? computePackageItemsTotal(
          service.packageItems.map((item) => ({
            price: item.includedService.price,
            quantity: item.quantity,
          }))
        )
      : null;

  const savings =
    itemsTotal != null && service.pricingStrategy
      ? resolvePackagePrice({
          itemsTotal,
          pricingStrategy: service.pricingStrategy as
            | "STANDARD_TOTAL"
            | "CUSTOM_PRICE"
            | "PERCENTAGE_DISCOUNT"
            | "FIXED_DISCOUNT",
          customPrice: service.price,
          discountPercent: service.discountPercent,
          discountAmount: service.discountAmount,
        }).savings
      : null;

  return {
    id: service.id,
    name: service.name,
    description: service.description,
    duration: service.duration,
    price: service.price,
    categoryId: service.categoryId,
    categoryName: service.category?.name ?? null,
    sortOrder: service.sortOrder,
    catalogType: service.catalogType,
    audience: service.audience,
    status: service.status,
    onlineBooking: service.onlineBooking,
    inStoreBooking: service.inStoreBooking,
    pricingStrategy: service.pricingStrategy,
    discountPercent: service.discountPercent,
    discountAmount: service.discountAmount,
    itemsTotal,
    savings,
    employees: service.employees,
    packageItems: service.packageItems ?? [],
    parentAddOnLinks: service.parentAddOnLinks ?? [],
    addOnParentLinks: service.addOnParentLinks ?? [],
  };
}
