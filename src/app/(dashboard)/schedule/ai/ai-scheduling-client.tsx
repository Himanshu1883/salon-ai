"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAiSchedulingSuggestions,
  bookSuggestedSlot,
} from "@/actions/ai-scheduling";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Calendar, Clock, User, Armchair } from "lucide-react";
import { format } from "date-fns";

type Service = { id: string; name: string; duration: number };
type Employee = { id: string; name: string };

type Suggestion = {
  scheduledAt: string;
  employeeId: string;
  employeeName: string;
  availableSeats: number;
  estimatedDuration: number;
  waitMinutes: number;
  explanation?: string;
};

export function AiSchedulingClient({
  services,
  employees,
  defaultFrom,
  defaultTo,
  openAiEnabled,
}: {
  services: Service[];
  employees: Employee[];
  defaultFrom: string;
  defaultTo: string;
  openAiEnabled: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [preferredEmployeeId, setPreferredEmployeeId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [serviceInfo, setServiceInfo] = useState<Service | null>(null);

  async function handleSuggest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuggestions([]);

    const formData = new FormData(e.currentTarget);
    formData.set("serviceIds", serviceId);
    if (preferredEmployeeId && preferredEmployeeId !== "any") {
      formData.set("preferredEmployeeId", preferredEmployeeId);
    }

    const result = await getAiSchedulingSuggestions(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuggestions(result.suggestions ?? []);
    setServiceInfo(result.service ?? null);
  }

  async function handleBook(slot: Suggestion) {
    setBooking(slot.scheduledAt);
    const formData = new FormData();
    formData.set("customerName", customerName);
    formData.set("customerPhone", customerPhone);
    formData.set("serviceId", serviceId);
    formData.set("employeeId", slot.employeeId);
    formData.set("scheduledAt", slot.scheduledAt);

    const result = await bookSuggestedSlot(formData);
    setBooking(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/sales/appointments");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-rose-600" />
          <h1 className="text-3xl font-bold text-stone-900">AI Scheduling</h1>
        </div>
        <p className="mt-1 text-stone-500">
          Smart time slot suggestions based on staff availability and queue load
          {openAiEnabled ? " · OpenAI enabled" : " · Rule-based mode"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Find the best time</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSuggest} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer name</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone (optional)</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Service</Label>
                <Select value={serviceId} onValueChange={setServiceId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.duration} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Preferred stylist (optional)</Label>
                <Select value={preferredEmployeeId} onValueChange={setPreferredEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any available" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any available</SelectItem>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFrom">From date</Label>
                <Input id="dateFrom" name="dateFrom" type="date" defaultValue={defaultFrom} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">To date</Label>
                <Input id="dateTo" name="dateTo" type="date" defaultValue={defaultTo} />
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading || !serviceId}>
              <Sparkles className="h-4 w-4" />
              {loading ? "Finding slots..." : "Get AI suggestions"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Top {suggestions.length} suggestions
            {serviceInfo && ` for ${serviceInfo.name}`}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {suggestions.map((slot, i) => (
              <Card key={i} className="border-rose-100">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge>#{i + 1} pick</Badge>
                    <Badge variant="secondary">{slot.waitMinutes} min wait</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-rose-600" />
                    {format(new Date(slot.scheduledAt), "EEE, MMM d · h:mm a")}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-rose-600" />
                    {slot.employeeName}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-rose-600" />
                    {slot.estimatedDuration} min
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Armchair className="h-4 w-4 text-rose-600" />
                    {slot.availableSeats} seats available
                  </div>
                  {slot.explanation && (
                    <p className="text-sm text-stone-600">{slot.explanation}</p>
                  )}
                  <Button
                    className="w-full"
                    disabled={booking === slot.scheduledAt}
                    onClick={() => handleBook(slot)}
                  >
                    {booking === slot.scheduledAt ? "Booking..." : "Book this slot"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
