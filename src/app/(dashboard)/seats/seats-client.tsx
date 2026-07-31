"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSeatsConfig, updateSeatStatus } from "@/actions/seats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Armchair } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

type Seat = {
  id: string;
  number: number;
  status: string;
  employee: { name: string } | null;
  earnings: {
    totalRevenue: number;
    paidInvoiceCount: number;
  };
};

const statusVariant: Record<string, "success" | "destructive" | "warning"> = {
  available: "success",
  occupied: "destructive",
  reserved: "warning",
};

export function SeatsClient({
  seats,
  totalSeats,
}: {
  seats: Seat[];
  totalSeats: number;
}) {
  const router = useRouter();
  const [newTotal, setNewTotal] = useState(totalSeats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleConfigSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const result = await updateSeatsConfig(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess("Seat configuration updated");
    router.refresh();
  }

  async function toggleSeatStatus(seat: Seat) {
    const nextStatus =
      seat.status === "available"
        ? "reserved"
        : seat.status === "reserved"
          ? "available"
          : null;

    if (!nextStatus) return;

    await updateSeatStatus(seat.id, nextStatus);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Seats & Workstations</h1>
        <p className="mt-1 text-stone-500">
          Configure salon capacity and monitor seat availability
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConfigSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totalSeats">Total seats</Label>
                <Input
                  id="totalSeats"
                  name="totalSeats"
                  type="number"
                  min={1}
                  max={50}
                  value={newTotal}
                  onChange={(e) => setNewTotal(Number(e.target.value))}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-emerald-600">{success}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Updating..." : "Update seats"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Seat map ({seats.filter((s) => s.status === "available").length}{" "}
              available)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {seats.map((seat) => (
                <button
                  key={seat.id}
                  type="button"
                  onClick={() => toggleSeatStatus(seat)}
                  disabled={seat.status === "occupied"}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    seat.status === "occupied"
                      ? "border-red-200 bg-red-50 cursor-not-allowed"
                      : seat.status === "reserved"
                        ? "border-amber-200 bg-amber-50 hover:bg-amber-100"
                        : "border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Armchair className="h-5 w-5" />
                      <span className="font-semibold">Seat {seat.number}</span>
                    </div>
                    <Badge variant={statusVariant[seat.status] ?? "secondary"}>
                      {seat.status}
                    </Badge>
                  </div>
                  {seat.employee && (
                    <p className="mt-2 text-xs text-stone-600">
                      {seat.employee.name}
                    </p>
                  )}
                  <p className="mt-2 text-xs font-medium text-stone-700">
                    {formatCurrency(seat.earnings.totalRevenue)} revenue
                  </p>
                  <p className="text-xs text-stone-400">
                    {seat.earnings.paidInvoiceCount} paid invoice
                    {seat.earnings.paidInvoiceCount !== 1 ? "s" : ""}
                  </p>
                  {seat.status !== "occupied" && (
                    <p className="mt-1 text-xs text-stone-400">
                      Click to toggle available/reserved
                    </p>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
