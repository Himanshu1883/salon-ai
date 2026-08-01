import { getSalonSupportThread } from "@/actions/support-chat";
import { SalonSupportClient } from "@/components/support/salon-support-client";
import { requireSession } from "@/lib/auth";

export default async function SalonSupportPage() {
  const session = await requireSession();
  const thread = await getSalonSupportThread();

  return (
    <SalonSupportClient
      initialMessages={thread.messages}
      userName={session.user.name ?? "Salon user"}
    />
  );
}
