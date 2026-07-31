"use client";

import { useState } from "react";
import { createCustomer } from "@/actions/customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ClientsAddDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (customer: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    notes: string | null;
    loyaltyPoints: number;
    createdAt: Date;
    visitCount: number;
    totalPaid: number;
    totalSales: number;
    reviewCount: number;
    lastVisit: Date | null;
  }) => void;
};

function ClientForm({
  onSuccess,
}: {
  onSuccess: ClientsAddDialogProps["onSuccess"];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await createCustomer(new FormData(e.currentTarget));
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if ("customer" in result && result.customer) {
      onSuccess({
        ...result.customer,
        visitCount: 0,
        totalPaid: 0,
        totalSales: 0,
        reviewCount: 0,
        lastVisit: null,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Mobile number</Label>
          <Input id="phone" name="phone" type="tel" className="rounded-xl" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" className="rounded-xl" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={3} className="rounded-xl" />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6]"
      >
        {loading ? "Saving..." : "Add client"}
      </Button>
    </form>
  );
}

export function ClientsAddDialog({
  open,
  onOpenChange,
  onSuccess,
}: ClientsAddDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add client</DialogTitle>
        </DialogHeader>
        <ClientForm onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}
