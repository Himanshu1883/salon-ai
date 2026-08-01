import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RESERVED_SALON_SLUGS } from "@/lib/salon-paths";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug")?.trim().toLowerCase();

  if (!slug || RESERVED_SALON_SLUGS.has(slug)) {
    return NextResponse.json({ error: "Invalid salon workspace" }, { status: 400 });
  }

  try {
    const salon = await prisma.salon.findUnique({
      where: { slug },
      select: { slug: true, name: true },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    return NextResponse.json(salon);
  } catch (error) {
    console.error("[salons/lookup] failed:", error);
    return NextResponse.json(
      { error: "Lookup temporarily unavailable" },
      { status: 503 }
    );
  }
}
