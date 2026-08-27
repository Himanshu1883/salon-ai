import { Suspense } from "react";
import { AdminSupportClient } from "@/components/support/admin-support-client";
import {
  getAdminSupportConversations,
  getAdminSupportMessages,
  getAdminSupportStatusCounts,
} from "@/actions/support-chat";

async function AdminSupportData() {
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

function SupportSkeleton() {
  return (
    <div className="flex h-[min(720px,calc(100vh-8rem))] animate-pulse gap-4">
      <div className="w-full max-w-sm rounded-2xl bg-stone-100" />
      <div className="flex-1 rounded-2xl bg-stone-50" />
    </div>
  );
}

export default function AdminSupportPage() {
  return (
    <Suspense fallback={<SupportSkeleton />}>
      <AdminSupportData />
    </Suspense>
  );
}
