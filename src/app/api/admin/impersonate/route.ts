import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();
  const salonSlug = searchParams.get("salon")?.trim();

  if (!token || !salonSlug) {
    return NextResponse.redirect(
      new URL("/admin/salons?error=missing_impersonation_token", request.url)
    );
  }

  const result = await signIn("credentials", {
    impersonationToken: token,
    redirect: false,
  });

  if (result?.error) {
    console.error("[admin-impersonate] sign-in failed:", result.error);
    return NextResponse.redirect(
      new URL("/admin/salons?error=impersonation_failed", request.url)
    );
  }

  return NextResponse.redirect(new URL(`/${salonSlug}/dashboard`, request.url));
}
