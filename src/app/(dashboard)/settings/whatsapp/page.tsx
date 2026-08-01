import { getWhatsAppSettingsAction } from "@/actions/whatsapp";
import { WhatsAppSettingsClient } from "./whatsapp-settings-client";

export default async function WhatsAppSettingsPage() {
  const settings = await getWhatsAppSettingsAction();
  return <WhatsAppSettingsClient initialSettings={settings} />;
}
