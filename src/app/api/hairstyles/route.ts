import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getHairstyles } from "@/actions/hairstyles";

export async function GET(request: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.salonId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const result = await getHairstyles({
    search: searchParams.get("search") ?? undefined,
    gender: (searchParams.get("gender") as "MEN" | "WOMEN" | "UNISEX") || undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
  });

  return NextResponse.json(result);
}
