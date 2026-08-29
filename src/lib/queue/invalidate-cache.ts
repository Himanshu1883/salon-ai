import { revalidatePath } from "next/cache";
import { revalidateSalonCache } from "@/lib/salon-cache";

export function invalidateQueueCache(
  salonId: string,
  options?: { revalidateAppointmentPages?: boolean }
) {
  revalidateSalonCache(
    salonId,
    "queue",
    "check-in",
    "dashboard-kpis",
    "dashboard-widgets",
    "dashboard-stats",
    "appointments"
  );
  revalidatePath("/queue");
  revalidatePath("/check-in");
  revalidatePath("/dashboard");
  if (options?.revalidateAppointmentPages !== false) {
    revalidatePath("/sales/appointments");
    revalidatePath("/appointments");
  }
}
