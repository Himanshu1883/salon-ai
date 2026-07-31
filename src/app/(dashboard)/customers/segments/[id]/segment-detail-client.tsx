"use client";

import Link from "next/link";
import {
  UserPlus,
  Calendar,
  Sparkles,
  Heart,
  Clock,
  IndianRupee,
  Cake,
  UserX,
  Repeat,
  Crown,
  Moon,
  Users,
  ArrowLeft,
  UserCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SegmentIconKey } from "@/lib/segments";
import { format } from "date-fns";

const ICON_MAP: Record<
  SegmentIconKey | "sparkles",
  React.ComponentType<{ className?: string }>
> = {
  "user-plus": UserPlus,
  calendar: Calendar,
  sparkles: Sparkles,
  heart: Heart,
  clock: Clock,
  "indian-rupee": IndianRupee,
  cake: Cake,
  "user-x": UserX,
  repeat: Repeat,
  crown: Crown,
  moon: Moon,
};

type SegmentDetail = {
  id: string;
  name: string;
  description: string;
  iconKey: string;
  clientCount: number;
  type: "standard" | "custom";
};

type SegmentCustomer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  createdAt: Date;
};

export function SegmentDetailClient({
  segment,
  customers,
}: {
  segment: SegmentDetail;
  customers: SegmentCustomer[];
}) {
  const Icon = ICON_MAP[segment.iconKey as SegmentIconKey] ?? Users;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/clients/segments">
            <ArrowLeft className="h-4 w-4" />
            Back to segments
          </Link>
        </Button>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-stone-900">{segment.name}</h1>
            <Badge variant="secondary">{segment.clientCount} clients</Badge>
            {segment.type === "custom" && <Badge variant="outline">Custom</Badge>}
          </div>
          <p className="mt-1 text-stone-500">{segment.description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Clients in this segment</CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="py-10 text-center">
              <UserCircle className="mx-auto h-10 w-10 text-stone-300" />
              <p className="mt-2 text-sm text-stone-500">
                No clients match this segment yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Profile</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone ?? "—"}</TableCell>
                    <TableCell>{customer.email ?? "—"}</TableCell>
                    <TableCell>
                      {format(new Date(customer.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/clients/${customer.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
