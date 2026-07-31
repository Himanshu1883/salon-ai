import { processDueReminders } from "@/actions/sms";

export async function ReminderProcessor() {
  await processDueReminders();
  return null;
}
