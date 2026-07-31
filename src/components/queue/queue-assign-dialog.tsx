"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Employee, QueueEntry, Seat } from "./types";

type QueueAssignDialogProps = {
  entry: QueueEntry | null;
  employees: Employee[];
  seats: Seat[];
  employeeId: string;
  seatId: string;
  loading: boolean;
  error: string;
  onEmployeeChange: (id: string) => void;
  onSeatChange: (id: string) => void;
  onClose: () => void;
  onAssign: () => void;
};

export function QueueAssignDialog({
  entry,
  employees,
  seats,
  employeeId,
  seatId,
  loading,
  error,
  onEmployeeChange,
  onSeatChange,
  onClose,
  onAssign,
}: QueueAssignDialogProps) {
  return (
    <Dialog open={!!entry} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#1C103D]">
            Assign {entry?.customer.name} to stylist
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Employee</Label>
            <Select value={employeeId} onValueChange={onEmployeeChange}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select stylist" />
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
            <Label>Seat (optional)</Label>
            <Select
              value={seatId || "none"}
              onValueChange={(v) => onSeatChange(v === "none" ? "" : v)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="No seat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No seat</SelectItem>
                {seats.map((seat) => (
                  <SelectItem key={seat.id} value={seat.id}>
                    Seat {seat.number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            onClick={onAssign}
            disabled={loading || !employeeId}
            className="w-full rounded-xl bg-[#6C3BFF] hover:bg-[#5B2FE0]"
          >
            {loading ? "Assigning..." : "Assign customer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
