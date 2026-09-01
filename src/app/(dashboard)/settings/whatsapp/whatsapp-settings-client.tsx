"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  updateWhatsAppSettings,
} from "@/actions/whatsapp";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DEFAULT_BILLING_MESSAGE_TEMPLATE,
  WHATSAPP_TEMPLATE_VARIABLES,
  buildBillingWhatsAppMessage,
} from "@/lib/whatsapp";
import { MessageCircle, RotateCcw, Save } from "lucide-react";
import { getAppOrigin } from "@/lib/salon-paths";

type Settings = {
  billingMessageTemplate: string;
  autoOpenAfterPayment: boolean;
};

const SAMPLE_CONTEXT = {
  invoiceId: "preview",
  invoiceNumber: "INV-2026-000123",
  customerName: "Priya Sharma",
  customerPhone: "9876543210",
  amount: 2499,
  paymentMethod: "upi",
  paidAt: new Date(),
  staffName: "Ananya",
  salonName: "Glow Studio",
  services: "Hair Spa, Blow Dry",
};

export function WhatsAppSettingsClient({
  initialSettings,
}: {
  initialSettings: Settings;
}) {
  const router = useRouter();
  const [template, setTemplate] = useState(initialSettings.billingMessageTemplate);
  const [autoOpen, setAutoOpen] = useState(initialSettings.autoOpenAfterPayment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const preview = useMemo(() => {
    return buildBillingWhatsAppMessage(
      template,
      SAMPLE_CONTEXT,
      `${getAppOrigin()}/billing/preview`
    );
  }, [template]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const result = await updateWhatsAppSettings({
      billingMessageTemplate: template,
      autoOpenAfterPayment: autoOpen,
    });

    setLoading(false);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    setSuccess("WhatsApp settings saved");
    router.refresh();
  }

  function insertVariable(key: string) {
    setTemplate((prev) => `${prev}{${key}}`);
  }

  function resetToDefault() {
    setTemplate(DEFAULT_BILLING_MESSAGE_TEMPLATE);
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card className="border-violet-100 bg-gradient-to-br from-violet-50/50 to-white">
        <CardContent className="flex items-start gap-3 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/10">
            <MessageCircle className="h-5 w-5 text-[#25D366]" />
          </div>
          <div>
            <p className="font-semibold text-stone-900">Post-billing WhatsApp messages</p>
            <p className="mt-1 text-sm text-stone-600">
              Customize the message sent to customers after billing. Messages open in WhatsApp
              with a pre-filled text — no Business API required.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Message template</CardTitle>
            <CardDescription>
              Edit the thank-you message sent after invoice creation or payment. Click a variable
              to insert it. Paste your full Google review or Maps link — it is sent as written.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {WHATSAPP_TEMPLATE_VARIABLES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => insertVariable(v.key)}
                  className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-100"
                  title={v.description}
                >
                  {`{${v.key}}`}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="template">Template text</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetToDefault}
                  className="h-8 text-violet-700"
                >
                  <RotateCcw className="mr-1 h-3.5 w-3.5" />
                  Reset default
                </Button>
              </div>
              <Textarea
                id="template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={14}
                className="font-mono text-sm leading-relaxed"
                required
              />
              <p className="text-xs text-stone-500">
                Use {"{salonName}"} for the salon name. Your review link is sent in full, exactly
                as you pasted it.
              </p>
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-stone-200 p-4">
              <div>
                <p className="text-sm font-medium text-stone-900">
                  Auto-open WhatsApp after payment
                </p>
                <p className="text-xs text-stone-500">
                  Opens WhatsApp automatically when payment is recorded in billing
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoOpen}
                onClick={() => setAutoOpen((v) => !v)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  autoOpen ? "bg-violet-600" : "bg-stone-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    autoOpen ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}

            <Button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700">
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save template"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live preview</CardTitle>
              <CardDescription>How the message will appear in WhatsApp</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-stone-200 bg-[#ECE5DD] p-4">
                <div className="max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm leading-relaxed text-stone-900 shadow-sm">
                  {preview}
                </div>
                <p className="mt-2 text-right text-[10px] text-stone-500">
                  {format(new Date(), "h:mm a")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available variables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {WHATSAPP_TEMPLATE_VARIABLES.map((v) => (
                <div
                  key={v.key}
                  className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {`{${v.key}}`}
                    </Badge>
                    <p className="mt-1 text-sm text-stone-600">{v.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
