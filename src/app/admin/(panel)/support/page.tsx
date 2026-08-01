import {
  getAdminSupportConversations,
  getAdminSupportMessages,
  getAdminSupportStatusCounts,
} from "@/actions/support-chat";
import { AdminSupportClient } from "@/components/support/admin-support-client";

export default async function AdminSupportPage() {
  const [conversations, statusCounts] = await Promise.all([
    getAdminSupportConversations(),
    getAdminSupportStatusCounts(),
  ]);

  const selected = conversations[0] ?? null;
  const detail = selected ? await getAdminSupportMessages(selected.id) : null;

  return (
    <AdminSupportClient
      initialConversations={conversations}
      initialSelectedId={selected?.id ?? null}
      initialDetail={detail}
      initialStatusCounts={statusCounts}
    />
  );
}
