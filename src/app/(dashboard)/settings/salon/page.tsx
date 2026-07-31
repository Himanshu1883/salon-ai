import { getSalonProfile, canAccessSettings } from "@/actions/salon";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SalonProfileClient } from "./salon-client";

export default async function SalonSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const allowed = await canAccessSettings(session.user.id);
  if (!allowed) redirect("/dashboard");

  const profile = await getSalonProfile();
  return <SalonProfileClient profile={profile} />;
}
