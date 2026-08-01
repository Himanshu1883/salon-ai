import type { PrismaClient } from "@/generated/prisma/client";
import { addDays, setHours, setMinutes, startOfDay } from "date-fns";

const TEST_USER_EMAIL = "test@abc.com";

export async function seedTestSalonAppointments(prisma: PrismaClient) {
  const user = await prisma.user.findUnique({
    where: { email: TEST_USER_EMAIL },
    include: { salon: true },
  });

  if (!user?.salonId) {
    console.log(`seedTestSalonAppointments: ${TEST_USER_EMAIL} not found, skipping.`);
    return { created: 0, skipped: true };
  }

  const salonId = user.salonId;
  const existing = await prisma.appointment.count({ where: { salonId } });
  if (existing >= 3) {
    console.log(
      `seedTestSalonAppointments: ${existing} appointments already exist for ${user.salon?.name ?? salonId}.`
    );
    return { created: 0, skipped: true };
  }

  const [service, customer] = await Promise.all([
    prisma.service.findFirst({
      where: { salonId },
      orderBy: { name: "asc" },
    }),
    prisma.customer.findFirst({
      where: { salonId },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!service || !customer) {
    console.log("seedTestSalonAppointments: missing service or customer, skipping.");
    return { created: 0, skipped: true };
  }

  let employee = await prisma.employee.findFirst({
    where: { salonId, status: "active" },
    orderBy: { name: "asc" },
  });

  if (!employee) {
    employee = await prisma.employee.create({
      data: {
        salonId,
        name: "Demo Stylist",
        role: "stylist",
        status: "active",
        specialties: "Hair, makeup",
      },
    });
  }

  const slots = [
    setMinutes(setHours(startOfDay(new Date()), 14), 0),
    setMinutes(setHours(startOfDay(addDays(new Date(), 1)), 11), 0),
    setMinutes(setHours(startOfDay(addDays(new Date(), 3)), 16), 30),
  ];

  for (const scheduledAt of slots) {
    await prisma.appointment.create({
      data: {
        salonId,
        customerId: customer.id,
        serviceId: service.id,
        employeeId: employee.id,
        scheduledAt,
        status: "scheduled",
      },
    });
  }

  console.log(
    `seedTestSalonAppointments: created ${slots.length} demo appointments for ${user.salon?.name ?? salonId}.`
  );

  return { created: slots.length, skipped: false };
}
