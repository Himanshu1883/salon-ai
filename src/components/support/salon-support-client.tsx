"use client";

import { useCallback } from "react";
import { HeadphonesIcon } from "lucide-react";
import { SupportChatPanel } from "@/components/support/support-chat-panel";
import {
  getSalonSupportThread,
  sendSalonSupportMessage,
  type SupportMessageDTO,
} from "@/actions/support-chat";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

type SalonSupportClientProps = {
  initialMessages: SupportMessageDTO[];
};

export function SalonSupportClient({ initialMessages }: SalonSupportClientProps) {
  const refreshMessages = useCallback(async () => {
    const thread = await getSalonSupportThread();
    return thread.messages;
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25">
            <HeadphonesIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-dashboard-text">
              Customer Support
            </h1>
            <p className="text-sm text-dashboard-muted">
              Chat with the Salon AI team — we typically reply within one business day.
            </p>
          </div>
        </div>
      </div>

      <DashboardCard className="overflow-hidden p-0">
        <SupportChatPanel
          messages={initialMessages}
          viewer="salon"
          onSend={sendSalonSupportMessage}
          onRefresh={refreshMessages}
          emptyHint="Describe your question or issue and our support team will get back to you here."
        />
      </DashboardCard>
    </div>
  );
}
