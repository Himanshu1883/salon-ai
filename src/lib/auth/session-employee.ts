import { prisma } from "@/lib/prisma";

export async function resolveSessionEmployee(
  userId: string,
  salonId: string,
  userEmail?: string | null
) {
  const user = await prisma.user.findFirst({
    where: { id: userId, salonId },
    select: {
      employeeId: true,
      email: true,
      employee: {
        select: { id: true, name: true, status: true },
      },
    },
  });

  if (user?.employee && user.employee.status === "active") {
    return {
      employeeId: user.employee.id,
      employeeName: user.employee.name,
    };
  }

  if (user?.employeeId) {
    const employee = await prisma.employee.findFirst({
      where: { id: user.employeeId, salonId },
      select: { id: true, name: true, status: true },
    });
    if (employee) {
      return { employeeId: employee.id, employeeName: employee.name };
    }
  }

  const email = userEmail ?? user?.email;
  if (email) {
    const employee = await prisma.employee.findFirst({
      where: {
        salonId,
        status: "active",
        email: { equals: email, mode: "insensitive" },
      },
      select: { id: true, name: true },
    });
    if (employee) {
      return { employeeId: employee.id, employeeName: employee.name };
    }
  }

  return { employeeId: null, employeeName: null };
}
