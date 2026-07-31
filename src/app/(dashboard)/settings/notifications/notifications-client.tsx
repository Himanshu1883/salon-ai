"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  sendManualSms,
  retrySmsReminder,
  cancelSmsReminder,
} from "@/actions/sms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, RefreshCw, X, AlertCircle } from "lucide-react";
import { format } from "date-fns";

type Reminder = {
  id: string;
  type: string;
  recipientPhone: string;
  recipientName: string;
  message: string;
  scheduledAt: Date;
  sentAt: Date | null;
  status: string;
  appointment: {
    service: { name: string };
  } | null;
};

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  pending: "warning",
  sent: "success",
  failed: "destructive",
  cancelled: "secondary",
};

function ReminderList({
  items,
  loading,
  onRetry,
  onCancel,
}: {
  items: Reminder[];
  loading: boolean;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-stone-500">No reminders</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((r) => (
        <div key={r.id} className="rounded-lg border border-stone-200 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium">{r.recipientName}</p>
              <p className="text-sm text-stone-500">{r.recipientPhone}</p>
              <p className="mt-1 text-sm text-stone-600">{r.message}</p>
              <p className="mt-1 text-xs text-stone-400">
                {r.type.replace("_", " ")} ·{" "}
                {format(new Date(r.scheduledAt), "MMM d, h:mm a")}
                {r.sentAt && ` · Sent ${format(new Date(r.sentAt), "MMM d, h:mm a")}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant[r.status] ?? "default"}>
                {r.status}
              </Badge>
              {r.status === "failed" && (
                <Button size="sm" variant="outline" disabled={loading} onClick={() => onRetry(r.id)}>
                  <RefreshCw className="h-3 w-3" /> Retry
                </Button>
              )}
              {r.status === "pending" && (
                <Button size="sm" variant="ghost" disabled={loading} onClick={() => onCancel(r.id)}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationsClient({
  config,
  reminders,
}: {
  config: { twilioConfigured: boolean; demoMode: boolean };
  reminders: Reminder[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const pending = reminders.filter((r) => r.status === "pending");
  const sent = reminders.filter((r) => r.status === "sent");
  const failed = reminders.filter((r) => r.status === "failed");

  async function handleManualSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const result = await sendManualSms(new FormData(e.currentTarget));
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(
      "success" in result && result.success
        ? result.demoMode
          ? "SMS logged in demo mode (check server console)"
          : "SMS sent successfully"
        : "SMS sent"
    );
    e.currentTarget.reset();
    router.refresh();
  }

  async function handleRetry(id: string) {
    setLoading(true);
    await retrySmsReminder(id);
    setLoading(false);
    router.refresh();
  }

  async function handleCancel(id: string) {
    setLoading(true);
    await cancelSmsReminder(id);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card className={config.demoMode ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}>
        <CardContent className="flex items-center gap-3 p-4">
          {config.demoMode ? (
            <>
              <AlertCircle className="h-5 w-5 text-amber-700" />
              <div>
                <p className="font-medium text-amber-800">Demo mode — SMS logged only</p>
                <p className="text-sm text-amber-700">
                  Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to send real SMS.
                </p>
              </div>
            </>
          ) : (
            <>
              <MessageSquare className="h-5 w-5 text-emerald-700" />
              <p className="text-sm text-emerald-800">Twilio configured — SMS will be sent via Twilio.</p>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Send manual SMS</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSend} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient name</Label>
                <Input id="recipientName" name="recipientName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientPhone">Phone number</Label>
                <Input id="recipientPhone" name="recipientPhone" type="tel" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" required rows={3} />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-emerald-600">{success}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Sending..." : "Send SMS"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auto-reminders</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-stone-600 space-y-2">
            <p>Appointment reminders are automatically scheduled 24 hours before each appointment when a phone number is provided.</p>
            <p>Due reminders are processed when you visit the dashboard or this page.</p>
            <p>You can also trigger processing via <code className="rounded bg-stone-100 px-1">POST /api/cron/send-reminders</code></p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({sent.length})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({failed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <Card>
            <CardContent className="pt-6">
              <ReminderList items={pending} loading={loading} onRetry={handleRetry} onCancel={handleCancel} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sent">
          <Card>
            <CardContent className="pt-6">
              <ReminderList items={sent} loading={loading} onRetry={handleRetry} onCancel={handleCancel} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="failed">
          <Card>
            <CardContent className="pt-6">
              <ReminderList items={failed} loading={loading} onRetry={handleRetry} onCancel={handleCancel} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
