"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { getAttendanceLogCsv } from "@/actions/attendance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Download, ClipboardList } from "lucide-react";

type LogRow = {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkInAt: string;
  checkOutAt: string | null;
  method: string;
  confidence: number | null;
  hours: number;
};

type Employee = { id: string; name: string };

const methodVariant: Record<string, "default" | "secondary" | "outline"> = {
  face: "default",
  manual: "secondary",
  shift: "outline",
};

export function AttendanceLogClient({
  records,
  employees,
  selectedDate,
  selectedEmployeeId,
}: {
  records: LogRow[];
  employees: Employee[];
  selectedDate: string;
  selectedEmployeeId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [date, setDate] = useState(selectedDate);
  const [employeeId, setEmployeeId] = useState(selectedEmployeeId ?? "all");
  const [exporting, setExporting] = useState(false);

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", date);
    if (employeeId && employeeId !== "all") {
      params.set("employee", employeeId);
    } else {
      params.delete("employee");
    }
    router.push(`/team/attendance/log?${params.toString()}`);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const csv = await getAttendanceLogCsv(
        date,
        employeeId !== "all" ? employeeId : undefined
      );
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance-log-${date}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  const totalHours = records.reduce((sum, r) => sum + r.hours, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/team/attendance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">
            Attendance Log
          </h1>
          <p className="text-sm text-stone-500">
            Daily check-in and check-out records for your team
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-stone-200 bg-white p-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-40"
          />
        </div>
        <div>
          <Label>Employee</Label>
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger className="mt-1 w-48">
              <SelectValue placeholder="All employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All employees</SelectItem>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={applyFilters}>
          Apply
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={exporting}
          className="ml-auto gap-1"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">Records</p>
          <p className="text-2xl font-semibold text-stone-900">
            {records.length}
          </p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">Total hours</p>
          <p className="text-2xl font-semibold text-stone-900">
            {totalHours.toFixed(1)}h
          </p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">Date</p>
          <p className="text-2xl font-semibold text-stone-900">
            {format(parseISO(date), "MMM d, yyyy")}
          </p>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-stone-200 bg-white py-16 text-center">
          <ClipboardList className="h-10 w-10 text-stone-300" />
          <p className="text-stone-500">No attendance records for this date.</p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/team/attendance">Go to attendance kiosk</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{format(parseISO(r.date), "MMM d")}</TableCell>
                  <TableCell className="font-medium">{r.employeeName}</TableCell>
                  <TableCell>
                    {format(parseISO(r.checkInAt), "HH:mm")}
                  </TableCell>
                  <TableCell>
                    {r.checkOutAt
                      ? format(parseISO(r.checkOutAt), "HH:mm")
                      : "—"}
                  </TableCell>
                  <TableCell>{r.hours > 0 ? `${r.hours.toFixed(1)}h` : "—"}</TableCell>
                  <TableCell>
                    <Badge variant={methodVariant[r.method] ?? "secondary"}>
                      {r.method}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
