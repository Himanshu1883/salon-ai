import { Prisma } from "@/generated/prisma/client";

/** Minutes between HH:MM shift strings (PostgreSQL). */
export const SHIFT_MINUTES_CASE = Prisma.sql`
  CASE
    WHEN sh."startTime" IS NOT NULL AND sh."endTime" IS NOT NULL THEN
      GREATEST(0,
        (split_part(sh."endTime", ':', 1)::int * 60 + split_part(sh."endTime", ':', 2)::int) -
        (split_part(sh."startTime", ':', 1)::int * 60 + split_part(sh."startTime", ':', 2)::int)
      )
    ELSE 0
  END
`;

export function employeeAppointmentFilter(
  employeeId: string | null,
  column = Prisma.sql`a."employeeId"`
) {
  if (employeeId) {
    return Prisma.sql`AND (
      ${column} = ${employeeId}
      OR EXISTS (
        SELECT 1
        FROM "AppointmentServiceItem" asi
        WHERE asi."appointmentId" = a.id
          AND asi."employeeId" = ${employeeId}
      )
    )`;
  }
  return Prisma.sql`AND ${column} IS NOT NULL`;
}

export function employeeInvoiceFilter(employeeId: string | null) {
  return employeeId
    ? Prisma.sql`AND COALESCE(li."employeeId", i."employeeId") = ${employeeId}`
    : Prisma.sql`AND COALESCE(li."employeeId", i."employeeId") IS NOT NULL`;
}

export function employeeShiftFilter(employeeId: string | null) {
  return employeeId
    ? Prisma.sql`AND sh."employeeId" = ${employeeId}`
    : Prisma.sql``;
}
