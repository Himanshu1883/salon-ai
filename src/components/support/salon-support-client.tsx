"use client";

import { useCallback, useEffect } from "react";
import { HeadphonesIcon } from "lucide-react";
import { SupportChatPanel } from "@/components/support/support-chat-panel";
import {
  getSalonSupportThread,
  sendSalonSupportMessage,
  updateSalonSupportContext,
  type SupportMessageDTO,
} from "@/actions/support-chat";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

type SalonSupportClientProps = {
  initialMessages: SupportMessageDTO[];
  userName: string;
};

function parseUserAgent(ua: string) {
  let browser = "Unknown";
  let os = "Unknown";

  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = "Safari";
  else if (/Firefox\//.test(ua)) browser = "Firefox";

  if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";

  return { browser, os };
}

export function SalonSupportClient({
  initialMessages,
  userName,
}: SalonSupportClientProps) {
  useEffect(() => {
    const ua = navigator.userAgent;
    const { browser, os } = parseUserAgent(ua);

    void updateSalonSupportContext({
      currentPage: window.location.pathname,
      userName,
      browser,
      os,
      userAgent: ua.slice(0, 200),
    });
  }, [userName]);

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
              Chat with the Glow Desk team — we typically reply within one business day.
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
