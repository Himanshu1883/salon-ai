import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ForgotPasswordForm from "./forgot-password-form";
import {
  findSalonForAuthPage,
  resolveSalonSlugFromRequest,
} from "@/lib/salon-auth-page";

export async function generateMetadata(): Promise<Metadata> {
  const salonSlug = await resolveSalonSlugFromRequest();
  if (!salonSlug) {
    return { title: "Forgot password" };
  }

  const salon = await findSalonForAuthPage(salonSlug);

  return {
    title: salon ? `Forgot password — ${salon.name}` : "Forgot password",
  };
}

export default async function ForgotPasswordPage() {
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
      <ForgotPasswordForm salon={salon} />
    </Suspense>
  );
}
