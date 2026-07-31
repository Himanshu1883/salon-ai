import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ResetPasswordForm from "./reset-password-form";
import {
  findSalonForAuthPage,
  resolveSalonSlugFromRequest,
} from "@/lib/salon-auth-page";

export async function generateMetadata(): Promise<Metadata> {
  const salonSlug = await resolveSalonSlugFromRequest();
  if (!salonSlug) {
    return { title: "Reset password" };
  }

  const salon = await findSalonForAuthPage(salonSlug);

  return {
    title: salon ? `Reset password — ${salon.name}` : "Reset password",
  };
}

export default async function ResetPasswordPage() {
  const salonSlug = await resolveSalonSlugFromRequest();

  if (!salonSlug) {
    notFound();
  }

  const salon = await findSalonForAuthPage(salonSlug);

  if (!salon) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <ResetPasswordForm salon={salon} />
    </Suspense>
  );
}
