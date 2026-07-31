"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createShift,
  updateShift,
  deleteShift,
  type WeekShiftGrid,
} from "@/actions/shifts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowUpDown,
  Info,
} from "lucide-react";
import { MemberAvatar } from "@/components/team/member-avatar";
import {
  formatWeekRange,
  formatShiftRange,
  getWeekStart,
  parseDateKey,
} from "@/lib/team";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";

type Employee = { id: string; name: string };

type ShiftCell = {
  date: string;
  shift: {
    id: string;
    startTime: string | null;
    endTime: string | null;
    isWorking: boolean;
  } | null;
};

function ShiftForm({
  employees,
  initial,
  onSuccess,
  onDelete,
}: {
  employees: Employee[];
  initial?: {
    id?: string;
    employeeId: string;
    date: string;
    startTime?: string;
    endTime?: string;
    isWorking: boolean;
  };
  onSuccess: () => void;
  onDelete?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [employeeId, setEmployeeId] = useState(initial?.employeeId ?? "");
  const [isWorking, setIsWorking] = useState(initial?.isWorking ?? true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("employeeId", employeeId);
    formData.set("isWorking", String(isWorking));

    const result = initial?.id
      ? await updateShift(initial.id, formData)
      : await createShift(formData);

    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Team member</Label>
        <Select value={employeeId} onValueChange={setEmployeeId}>
          <SelectTrigger>
            <SelectValue placeholder="Select member" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={initial?.date}
        />
      </div>
      <div className="space-y-2">
        <Label>Shift type</Label>
        <Select
          value={isWorking ? "working" : "off"}
          onValueChange={(v) => setIsWorking(v === "working")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="working">Working shift</SelectItem>
            <SelectItem value="off">Not working</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isWorking && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">Start time</Label>
            <Input
              id="startTime"
              name="startTime"
              type="time"
              required
              defaultValue={initial?.startTime ?? "10:00"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">End time</Label>
            <Input
              id="endTime"
              name="endTime"
              type="time"
              required
              defaultValue={initial?.endTime ?? "19:00"}
            />
          </div>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading || !employeeId} className="flex-1">
          {loading ? "Saving..." : initial?.id ? "Update shift" : "Add shift"}
        </Button>
        {initial?.id && onDelete && (
          <Button type="button" variant="outline" onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}

export function ShiftsClient({
  grid,
  employees,
}: {
  grid: WeekShiftGrid;
  employees: Employee[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const weekStart = parseDateKey(grid.weekStart);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<{
    id?: string;
    employeeId: string;
    date: string;
    startTime?: string;
    endTime?: string;
    isWorking: boolean;
  } | null>(null);

  function navigateWeek(offset: number) {
    const newStart = addDays(weekStart, offset * 7);
    const params = new URLSearchParams(searchParams.toString());
    params.set("week", format(newStart, "yyyy-MM-dd"));
    router.push(`/team/shifts?${params.toString()}`);
  }

  function goToThisWeek() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("week", format(getWeekStart(new Date()), "yyyy-MM-dd"));
    router.push(`/team/shifts?${params.toString()}`);
  }

  function openCell(
    employeeId: string,
    date: string,
    cell: ShiftCell["shift"]
  ) {
    if (cell) {
      setEditing({
        id: cell.id,
        employeeId,
        date,
        startTime: cell.startTime ?? undefined,
        endTime: cell.endTime ?? undefined,
        isWorking: cell.isWorking,
      });
    } else {
      setEditing({
        employeeId,
        date,
        startTime: "10:00",
        endTime: "19:00",
        isWorking: true,
      });
    }
    setDialogOpen(true);
  }

  function handleSuccess() {
    setDialogOpen(false);
    setEditing(null);
    router.refresh();
  }

  async function handleDelete() {
    if (!editing?.id) return;
    if (!confirm("Delete this shift?")) return;
    await deleteShift(editing.id);
    handleSuccess();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-stone-900">
          Scheduled shifts
        </h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Options
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={goToThisWeek}>
                Go to this week
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Add
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditing({
                    employeeId: employees[0]?.id ?? "",
                    date: grid.weekDays[0],
                    startTime: "10:00",
                    endTime: "19:00",
                    isWorking: true,
                  });
                  setDialogOpen(true);
                }}
              >
                Add shift
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="outline" size="sm">
          <ArrowUpDown className="h-4 w-4" />
          Custom order
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToThisWeek}>
            This week
          </Button>
          <div className="flex items-center rounded-lg border border-stone-200">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => navigateWeek(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[180px] px-2 text-center text-sm font-medium text-stone-700">
              {formatWeekRange(weekStart)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => navigateWeek(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/80">
              <th className="sticky left-0 z-10 min-w-[200px] bg-stone-50/95 px-4 py-3 text-left font-medium text-stone-600" />
              {grid.weekDays.map((dayKey, i) => {
                const day = parseDateKey(dayKey);
                return (
                  <th
                    key={dayKey}
                    className="min-w-[120px] px-2 py-3 text-center font-medium text-stone-600"
                  >
                    <div>{format(day, "EEE")}</div>
                    <div className="text-xs font-normal text-stone-400">
                      {grid.dailyTotals[i]} hr
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {grid.rows.map((row) => (
              <tr key={row.employee.id} className="border-b border-stone-100">
                <td className="sticky left-0 z-10 bg-white px-4 py-3">
                  <div className="flex items-center gap-3">
                    <MemberAvatar
                      name={row.employee.name}
                      avatarUrl={row.employee.avatarUrl}
                    />
                    <div>
                      <p className="font-medium text-stone-900">
                        {row.employee.name}
                      </p>
                      <p className="text-xs text-stone-500">
                        {Math.round(row.weeklyHours)} hr
                      </p>
                    </div>
                  </div>
                </td>
                {row.cells.map((cell) => (
                  <td key={cell.date} className="px-2 py-2 align-top">
                    <button
                      type="button"
                      onClick={() =>
                        openCell(row.employee.id, cell.date, cell.shift)
                      }
                      className={cn(
                        "w-full rounded-md px-2 py-2 text-xs font-medium transition-colors",
                        cell.shift?.isWorking === false
                          ? "bg-stone-100 text-stone-500 hover:bg-stone-200"
                          : cell.shift?.startTime && cell.shift?.endTime
                            ? "bg-violet-100 text-violet-800 hover:bg-violet-200"
                            : "border border-dashed border-stone-200 text-stone-400 hover:border-violet-300 hover:bg-violet-50"
                      )}
                    >
                      {cell.shift?.isWorking === false
                        ? "Not working"
                        : cell.shift?.startTime && cell.shift?.endTime
                          ? formatShiftRange(
                              cell.shift.startTime,
                              cell.shift.endTime
                            )
                          : "—"}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Scheduled shifts show when team members are rostered to work. This is
          separate from your salon&apos;s opening hours — adjust opening hours in
          Settings if needed.
        </p>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? "Edit shift" : "Add shift"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <ShiftForm
              employees={employees}
              initial={editing}
              onSuccess={handleSuccess}
              onDelete={editing.id ? handleDelete : undefined}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
