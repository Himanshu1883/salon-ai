import { getSmsConfig, getSmsReminders } from "@/actions/sms";
import { NotificationsClient } from "./notifications-client";

export default async function NotificationsPage() {
  const [config, reminders] = await Promise.all([
    getSmsConfig(),
    getSmsReminders("all"),
  ]);

  return <NotificationsClient config={config} reminders={reminders} />;
}
