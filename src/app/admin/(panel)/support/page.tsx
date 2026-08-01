import {
  getAdminSupportConversations,
  getAdminSupportMessages,
} from "@/actions/support-chat";
import { AdminSupportClient } from "@/components/support/admin-support-client";

export default async function AdminSupportPage() {
  const conversations = await getAdminSupportConversations();
  const selected = conversations[0] ?? null;

  const thread = selected
    ? await getAdminSupportMessages(selected.id, { revalidate: false })
    : null;

  return (
    <AdminSupportClient
      initialConversations={conversations}
      initialSelectedId={selected?.id ?? null}
      initialMessages={thread?.messages ?? []}
      initialSalonName={thread?.salonName ?? null}
    />
  );
}
