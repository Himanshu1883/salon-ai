export const ATTENDANCE_STATUSES = [
  "WORKING",
  "COMPLETED",
  "MISSED_CHECKOUT",
  "LATE",
  "PRESENT",
  "ABSENT",
  "ON_LEAVE",
  "HALF_DAY",
  "CORRECTED",
] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export type AttendanceRecordView = {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkInAt: string;
  checkOutAt: string | null;
  status: AttendanceStatus;
  method: string;
  totalWorkedMinutes: number;
  lateMinutes: number;
  earlyCheckoutMinutes: number;
  notes: string | null;
  confidence: number | null;
};

export type AttendanceTodaySummary = {
  date: string;
  totalEmployees: number;
  present: number;
  working: number;
  completed: number;
  absent: number;
  late: number;
  missedCheckout: number;
};

export type MyAttendanceToday = {
  employeeId: string;
  employeeName: string;
  status: "none" | "working" | "completed" | "missed_checkout";
  checkInAt: string | null;
  checkOutAt: string | null;
  workedMinutes: number;
  lateMinutes: number;
  canCheckIn: boolean;
  canCheckOut: boolean;
  message?: string;
};
