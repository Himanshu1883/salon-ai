import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import LoginForm from "./login-form";

async function findSalonBySlug(salonSlug: string) {
  try {
    return await prisma.salon.findUnique({
      where: { slug: salonSlug },
      select: { name: true, slug: true },
    });
  } catch (error) {
    console.error("[login] failed to load salon by slug:", error);
    return null;
  }
}


async function resolveSalonSlug() {
  const headerStore = await headers();
  const fromHeader =
    headerStore.get("x-salon-slug") ??
    headerStore.get("x-middleware-request-x-salon-slug");
  if (fromHeader) return fromHeader;
  return (await cookies()).get("salon-slug")?.value ?? null;
}

export async function generateMetadata(): Promise<Metadata> {
  const salonSlug = await resolveSalonSlug();
  if (!salonSlug) {
    return { title: "Login" };
  }

  const salon = await findSalonBySlug(salonSlug);

  return {
    title: salon ? `Login — ${salon.name}` : "Login",
  };
}

export default async function LoginPage() {
  const salonSlug = await resolveSalonSlug();

  if (!salonSlug) {
    notFound();
  }

  const salon = await findSalonBySlug(salonSlug);

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
