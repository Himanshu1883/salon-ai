"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, ChevronDown, ChevronUp } from "lucide-react";

type DailyRow = {
  date: string;
  checkInAt: string;
  checkOutAt: string | null;
  hours: number;
  method: string;
  late: boolean;
};

type Summary = {
  employeeId: string;
  employeeName: string;
  daysPresent: number;
  scheduledDays: number;
  absentDays: number;
  totalHours: number;
  lateArrivals: number;
  avgCheckInTime: string | null;
  dailyBreakdown: DailyRow[];
};

type Employee = { id: string; name: string };

export function AttendanceReportsClient({
  report,
  employees,
  selectedYear,
  selectedMonth,
  selectedEmployeeId,
}: {
  report: {
    year: number;
    month: number;
    monthLabel: string;
    daysInMonth: number;
    summaries: Summary[];
  };
  employees: Employee[];
  selectedYear: number;
  selectedMonth: number;
  selectedEmployeeId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [year, setYear] = useState(String(selectedYear));
  const [month, setMonth] = useState(String(selectedMonth));
  const [employeeId, setEmployeeId] = useState(selectedEmployeeId ?? "all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = Array.from({ length: 3 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { value: String(y), label: String(y) };
  });

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", year);
    params.set("month", month);
    if (employeeId && employeeId !== "all") {
      params.set("employee", employeeId);
    } else {
      params.delete("employee");
    }
    router.push(`/team/attendance/reports?${params.toString()}`);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex items-center gap-4 print:hidden">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/team/attendance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-stone-900">
            Attendance Reports
          </h1>
          <p className="text-sm text-stone-500">
            Monthly summary per team member
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1">
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>

      <div className="hidden print:block">
        <h1 className="text-xl font-bold">Attendance Report — {report.monthLabel}</h1>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-stone-200 bg-white p-4 print:hidden">
        <div>
          <Label>Month</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="mt-1 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Year</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="mt-1 w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y.value} value={y.value}>
                  {y.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      </div>

      <p className="text-sm text-stone-500 print:text-stone-700">
        {report.monthLabel} · {report.summaries.length} team member
        {report.summaries.length !== 1 ? "s" : ""}
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {report.summaries.map((s) => (
          <div
            key={s.employeeId}
            className="rounded-lg border border-stone-200 bg-white p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-stone-900">{s.employeeName}</h3>
                <p className="text-xs text-stone-500">{report.monthLabel}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="print:hidden"
                onClick={() =>
                  setExpandedId(expandedId === s.employeeId ? null : s.employeeId)
                }
              >
                {expandedId === s.employeeId ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-stone-500">Days present</dt>
                <dd className="font-medium text-stone-900">{s.daysPresent}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Total hours</dt>
                <dd className="font-medium text-stone-900">{s.totalHours}h</dd>
              </div>
              <div>
                <dt className="text-stone-500">Absent days</dt>
                <dd className="font-medium text-stone-900">{s.absentDays}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Late arrivals</dt>
                <dd className="font-medium text-stone-900">{s.lateArrivals}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-stone-500">Avg check-in</dt>
                <dd className="font-medium text-stone-900">
                  {s.avgCheckInTime ?? "—"}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      {(expandedId || selectedEmployeeId) && (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white print:block">
          {report.summaries
            .filter(
              (s) =>
                !expandedId ||
                s.employeeId === expandedId ||
                (selectedEmployeeId && s.employeeId === selectedEmployeeId)
            )
            .map((s) => (
              <div key={s.employeeId} className="border-b last:border-0">
                <div className="bg-stone-50 px-4 py-2">
                  <h3 className="font-medium text-stone-900">
                    {s.employeeName} — daily breakdown
                  </h3>
                </div>
                {s.dailyBreakdown.length === 0 ? (
                  <p className="p-4 text-sm text-stone-500">No records this month.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>Check-out</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {s.dailyBreakdown.map((d) => (
                        <TableRow key={d.date}>
                          <TableCell>
                            {format(parseISO(d.date), "EEE, MMM d")}
                          </TableCell>
                          <TableCell>
                            {format(parseISO(d.checkInAt), "HH:mm")}
                          </TableCell>
                          <TableCell>
                            {d.checkOutAt
                              ? format(parseISO(d.checkOutAt), "HH:mm")
                              : "—"}
                          </TableCell>
                          <TableCell>
                            {d.hours > 0 ? `${d.hours.toFixed(1)}h` : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{d.method}</Badge>
                          </TableCell>
                          <TableCell>
                            {d.late ? (
                              <Badge variant="outline" className="text-amber-700">
                                Late
                              </Badge>
                            ) : (
                              <span className="text-stone-400">On time</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
