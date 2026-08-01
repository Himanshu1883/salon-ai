import { getSalonSupportThread } from "@/actions/support-chat";
import { SalonSupportClient } from "@/components/support/salon-support-client";

export default async function SalonSupportPage() {
  const thread = await getSalonSupportThread();

  return <SalonSupportClient initialMessages={thread.messages} />;
}
