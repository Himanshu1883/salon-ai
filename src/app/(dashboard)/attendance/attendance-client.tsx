"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  checkInSelf,
  checkOutSelf,
  getAttendancePageData,
} from "@/actions/attendance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDuration } from "@/lib/attendance/compute";
import { formatRecordTime } from "@/lib/attendance/presenter";
import {
  Clock,
  LogIn,
  LogOut,
  ScanFace,
  BarChart3,
  Users,
  AlertCircle,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AttendancePageData = Awaited<ReturnType<typeof getAttendancePageData>>;

const statusBadge: Record<string, string> = {
  WORKING: "bg-blue-50 text-blue-700 ring-blue-200/60",
  LATE: "bg-amber-50 text-amber-700 ring-amber-200/60",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
  CORRECTED: "bg-violet-50 text-violet-700 ring-violet-200/60",
  MISSED_CHECKOUT: "bg-red-50 text-red-700 ring-red-200/60",
  ABSENT: "bg-stone-100 text-stone-600 ring-stone-200/60",
};

function timezoneLabel(tz: string) {
  if (tz === "Asia/Kolkata") return "IST";
  return tz.replace("_", " ");
}

function AttendanceKpiCard({
  label,
  value,
  sublabel,
  accent = "default",
}: {
  label: string;
  value: React.ReactNode;
  sublabel: React.ReactNode;
  accent?: "default" | "warning" | "muted";
}) {
  return (
    <div className="rounded-2xl border border-[#E8ECF4] bg-[#FAFBFE] p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-2xl font-bold tabular-nums sm:text-3xl",
          accent === "warning"
            ? "text-amber-600"
            : accent === "muted"
              ? "text-[#1C103D]"
              : "text-[#1C103D]"
        )}
      >
        {value}
      </p>
      <div className="mt-2 text-xs text-[#6B7280]">{sublabel}</div>
    </div>
  );
}

export function AttendanceClient({
  initialData,
}: {
  initialData: AttendancePageData;
}) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function refresh(date?: string) {
    startTransition(async () => {
      const next = await getAttendancePageData(date ?? data.dateKey);
      setData(next);
      router.refresh();
    });
  }

  async function handleCheckIn() {
    setError("");
    const result = await checkInSelf();
    if (result.error) {
      setError(result.error);
      return;
    }
    refresh();
  }

  async function handleCheckOut() {
    setError("");
    const result = await checkOutSelf();
    if (result.error) {
      setError(result.error);
      return;
    }
    refresh();
  }

  const my = data.myToday;
  const dash = data.dashboard;
  const monthStats = data.monthStats;
  const tzLabel = timezoneLabel(data.timezone);
  const showSelfService =
    data.permissions.canCheckIn ||
    data.permissions.canCheckOut ||
    data.permissions.employeeLinked;

  const checkInDisplay =
    my?.checkInAt != null ? formatRecordTime(my.checkInAt) : "Not yet";

  return (
    <div className="space-y-6 pb-8">
      {"loadError" in data && data.loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {data.loadError}
        </div>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1C103D]">Attendance</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Daily check-in · {tzLabel}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(data.permissions.canReports || data.permissions.canViewAll) && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/team/attendance/reports">
                <BarChart3 className="mr-2 h-4 w-4" />
                Monthly view
                <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-60" />
              </Link>
            </Button>
          )}
          {data.permissions.canManage && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/team/attendance">
                <ScanFace className="mr-2 h-4 w-4" />
                Face kiosk
              </Link>
            </Button>
          )}
        </div>
      </div>

      {showSelfService && (
        <section className="rounded-[20px] border border-[#E8ECF4] bg-white p-5 shadow-[0_4px_24px_rgba(28,16,61,0.05)] sm:p-6">
          {!data.permissions.employeeLinked ? (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">Account not linked</p>
                <p className="mt-1 text-sm text-amber-800">
                  Your login is not linked to an employee profile. Ask your manager
                  to link your account in Team → Members.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <AttendanceKpiCard
                  label="Today's Check-in"
                  value={checkInDisplay}
                  sublabel={
                    my && my.lateMinutes > 0 ? (
                      <span className="inline-flex items-center gap-1 text-amber-700">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Late today · {formatDuration(my.lateMinutes)}
                      </span>
                    ) : my?.checkInAt ? (
                      "On time today"
                    ) : (
                      "Tap Check In below when you arrive"
                    )
                  }
                />
                <AttendanceKpiCard
                  label="Late This Month"
                  value={monthStats?.lateDays ?? 0}
                  accent={(monthStats?.lateDays ?? 0) > 0 ? "warning" : "default"}
                  sublabel={`Days marked late · ${tzLabel}`}
                />
                <AttendanceKpiCard
                  label="Leave This Month"
                  value={monthStats?.leaveDays ?? 0}
                  sublabel={
                    (monthStats?.leaveDays ?? 0) > 0
                      ? "Days on leave"
                      : "No leave recorded"
                  }
                />
              </div>

              {my && (my.checkOutAt || my.workedMinutes > 0) && (
                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                  <div className="rounded-xl bg-[#F7F8FC] px-4 py-3">
                    <p className="text-xs text-[#9CA3AF]">Check out</p>
                    <p className="mt-1 font-semibold text-[#1C103D]">
                      {my.checkOutAt ? formatRecordTime(my.checkOutAt) : "—"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#F7F8FC] px-4 py-3">
                    <p className="text-xs text-[#9CA3AF]">Worked today</p>
                    <p className="mt-1 font-semibold text-[#1C103D]">
                      {formatDuration(my.workedMinutes)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#F7F8FC] px-4 py-3">
                    <p className="text-xs text-[#9CA3AF]">Status</p>
                    <p className="mt-1 font-semibold capitalize text-[#1C103D]">
                      {my.status === "none"
                        ? "Not checked in"
                        : my.status.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <p className="mt-4 flex items-center gap-1.5 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </p>
              )}

              <div className="mt-5">
                {my?.canCheckIn && data.permissions.canCheckIn && (
                  <Button
                    onClick={handleCheckIn}
                    disabled={pending}
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] text-base font-semibold shadow-md hover:from-[#5B32E6] hover:to-[#7C4FE8] sm:w-auto sm:min-w-[220px]"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Check In
                  </Button>
                )}
                {my?.canCheckOut && data.permissions.canCheckOut && (
                  <Button
                    onClick={handleCheckOut}
                    disabled={pending}
                    variant="outline"
                    className="h-12 w-full rounded-xl border-2 border-[#6C3BFF]/30 bg-white text-base font-semibold text-[#6C3BFF] shadow-sm hover:bg-violet-50 sm:w-auto sm:min-w-[220px]"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Check Out
                  </Button>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {data.myHistory && data.myHistory.length > 0 && (
        <section className="rounded-[20px] border border-[#E8ECF4] bg-white p-5 shadow-[0_4px_24px_rgba(28,16,61,0.05)]">
          <h2 className="mb-4 text-lg font-semibold text-[#1C103D]">
            My recent attendance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#E8ECF4] text-xs uppercase tracking-wide text-[#9CA3AF]">
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">In</th>
                  <th className="pb-3 pr-4 font-medium">Out</th>
                  <th className="pb-3 pr-4 font-medium">Worked</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.myHistory.map((row) => (
                  <tr key={row.id} className="border-b border-[#F3F4F6]">
                    <td className="py-3 pr-4">{row.date}</td>
                    <td className="py-3 pr-4">
                      {formatRecordTime(row.checkInAt)}
                    </td>
                    <td className="py-3 pr-4">
                      {row.checkOutAt ? formatRecordTime(row.checkOutAt) : "—"}
                    </td>
                    <td className="py-3 pr-4">
                      {formatDuration(row.workedMinutes)}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-0 ring-1 ring-inset",
                          statusBadge[row.status] ?? statusBadge.WORKING
                        )}
                      >
                        {row.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {data.permissions.canViewAll && dash && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {[
              { label: "Staff", value: dash.summary.totalEmployees, icon: Users },
              { label: "Present", value: dash.summary.present },
              { label: "Working", value: dash.summary.working },
              { label: "Completed", value: dash.summary.completed },
              { label: "Absent", value: dash.summary.absent },
              { label: "Late", value: dash.summary.late },
              { label: "Missed out", value: dash.summary.missedCheckout },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-[#E8ECF4] bg-white p-4 shadow-sm"
              >
                <p className="text-xs font-medium text-[#9CA3AF]">{item.label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-[#1C103D]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <section className="rounded-[20px] border border-[#E8ECF4] bg-white shadow-[0_4px_24px_rgba(28,16,61,0.05)]">
            <div className="flex flex-col gap-3 border-b border-[#E8ECF4] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#1C103D]">
                  Team attendance
                </h2>
                <p className="text-sm text-[#6B7280]">
                  {format(parseISO(data.dateKey), "EEEE, d MMMM yyyy")}
                </p>
              </div>
              <Input
                type="date"
                value={data.dateKey}
                onChange={(e) => refresh(e.target.value)}
                className="w-full max-w-[180px]"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E8ECF4] bg-[#F7F8FC]/80 text-xs uppercase tracking-wide text-[#9CA3AF]">
                    <th className="px-4 py-3 font-medium">Employee</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Check in</th>
                    <th className="px-4 py-3 font-medium">Check out</th>
                    <th className="px-4 py-3 font-medium">Worked</th>
                    <th className="px-4 py-3 font-medium">Late</th>
                  </tr>
                </thead>
                <tbody>
                  {dash.rows.map((row) => (
                    <tr
                      key={row.employeeId}
                      className="border-b border-[#F3F4F6] hover:bg-[#FAFAFC]"
                    >
                      <td className="px-4 py-3 font-medium text-[#1C103D]">
                        {row.employeeName}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "border-0 ring-1 ring-inset",
                            statusBadge[row.status] ?? statusBadge.WORKING
                          )}
                        >
                          {row.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {row.checkInAt ? formatRecordTime(row.checkInAt) : "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {row.checkOutAt ? formatRecordTime(row.checkOutAt) : "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatDuration(row.workedMinutes)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-amber-700">
                        {row.lateMinutes > 0
                          ? formatDuration(row.lateMinutes)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
