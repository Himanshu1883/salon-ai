import { Suspense } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import LoginForm from "./login-form";

export async function generateMetadata(): Promise<Metadata> {
  const salonSlug = (await headers()).get("x-salon-slug");
  if (!salonSlug) {
    return { title: "Login" };
  }

  const salon = await prisma.salon.findUnique({
    where: { slug: salonSlug },
    select: { name: true },
  });

  return {
    title: salon ? `Login — ${salon.name}` : "Login",
  };
}

export default async function LoginPage() {
  const salonSlug = (await headers()).get("x-salon-slug");

  if (!salonSlug) {
    notFound();
  }

  const salon = await prisma.salon.findUnique({
    where: { slug: salonSlug },
    select: { name: true, slug: true },
  });

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
      <LoginForm salonSlug={salon.slug} salonName={salon.name} />
    </Suspense>
  );
}
