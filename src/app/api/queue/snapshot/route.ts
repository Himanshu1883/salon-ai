import { NextResponse } from "next/server";
import {
  getQueueEntries,
  getEstimatedWaitMinutes,
  getRecentCompletedCheckIns,
} from "@/actions/queue";

/** Lightweight queue snapshot for client-side refresh without full RSC reload. */
export async function GET() {
  try {
    const [entries, estimatedWait, completedEntries] = await Promise.all([
      getQueueEntries(),
      getEstimatedWaitMinutes(),
      getRecentCompletedCheckIns(),
    ]);

    return NextResponse.json(
      {
        entries: entries.map((e) => ({
          id: e.id,
          position: e.position,
          status: e.status,
          checkedInAt: e.checkedInAt,
          startedAt: e.startedAt,
          completedAt: e.completedAt,
          customerId: e.customerId,
          customer: {
            name: e.customer.name,
            phone: e.customer.phone,
          },
          employee: e.employee
            ? { id: e.employee.id, name: e.employee.name }
            : null,
          seat: e.seat ? { id: e.seat.id, number: e.seat.number } : null,
          services: e.services.map((qs) => ({
            service: {
              id: qs.service.id,
              name: qs.service.name,
              duration: qs.service.duration,
              price: qs.service.price,
            },
          })),
        })),
        estimatedWait,
        completedEntries: completedEntries.map((e) => ({
          id: e.id,
          completedAt: e.completedAt,
          employeeId: e.employeeId,
          seatId: e.seatId,
          customer: {
            name: e.customer.name,
            phone: e.customer.phone,
          },
          services: e.services.map((qs) => ({
            service: {
              id: qs.service.id,
              name: qs.service.name,
              price: qs.service.price,
            },
          })),
          invoices: e.invoices.map((inv) => ({
            id: inv.id,
            status: inv.status,
            paymentMethod: inv.paymentMethod,
            total: inv.total,
          })),
        })),
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
