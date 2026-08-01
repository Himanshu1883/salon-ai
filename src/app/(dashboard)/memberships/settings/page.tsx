import { getMembershipSettingsAction } from "@/actions/memberships";
import { MembershipSettingsClient } from "@/components/memberships/membership-settings-client";

export default async function MembershipSettingsPage() {
  const settings = await getMembershipSettingsAction();
  return <MembershipSettingsClient settings={settings} />;
}
