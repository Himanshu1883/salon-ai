import { getSalonProfile, canAccessSettings } from "@/actions/salon";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AccountSecuritySection } from "./account-security-section";
import { SalonProfileClient } from "./salon-client";

export default async function SalonSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const allowed = await canAccessSettings(session.user.id);
  if (!allowed) redirect("/dashboard");

  const profile = await getSalonProfile();
  const currentEmail = session.user.email ?? "";
  const salonSlug = session.user.salonSlug ?? profile?.slug ?? "";

  return (
    <div className="space-y-6">
      <SalonProfileClient profile={profile} />
      {currentEmail && salonSlug ? (
        <AccountSecuritySection
          currentEmail={currentEmail}
          salonSlug={salonSlug}
        />
      ) : null}
    </div>
  );
}
