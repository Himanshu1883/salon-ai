import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const salonAuthSelect = {
  name: true,
  slug: true,
  logoUrl: true,
  address: true,
  addressLine1: true,
  city: true,
  state: true,
  pincode: true,
  businessPhone: true,
  phone: true,
} as const;

export type SalonAuthBranding = {
  name: string;
  slug: string;
  logoUrl: string | null;
  address: string | null;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  businessPhone: string | null;
  phone: string | null;
};

export async function resolveSalonSlugFromRequest() {
  const headerStore = await headers();
  const fromHeader =
    headerStore.get("x-salon-slug") ??
    headerStore.get("x-middleware-request-x-salon-slug");
  if (fromHeader) return fromHeader;
  return (await cookies()).get("salon-slug")?.value ?? null;
}

export async function findSalonForAuthPage(salonSlug: string) {
  try {
    return await prisma.salon.findUnique({
      where: { slug: salonSlug },
      select: salonAuthSelect,
    });
  } catch (error) {
    console.error("[salon-auth] failed to load salon by slug:", error);
    return null;
  }
}
