import { requireSession } from "@/lib/auth";
import { getHairstyles, getHairstyleCategories } from "@/actions/hairstyles";
import { canHairConsultation } from "@/lib/hair-consultation/permissions";
import { redirect } from "next/navigation";
import { HairstyleAdminClient } from "@/components/hair-consultation/hairstyle-admin-client";

export default async function HairstyleAdminPage() {
  const session = await requireSession();
  if (!canHairConsultation(session.user, "manage_styles")) {
    redirect("/hair-consultation");
  }

  const [stylesResult, catsResult] = await Promise.all([
    getHairstyles(),
    getHairstyleCategories(),
  ]);

  return (
    <HairstyleAdminClient
      hairstyles={stylesResult.hairstyles ?? []}
      categories={catsResult.categories ?? []}
    />
  );
}
