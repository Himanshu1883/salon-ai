import { prisma } from "@/lib/prisma";

export function isMissingEmployeeIdColumn(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const e = error as { code?: string; message?: string };
  return (
    e.code === "P2022" ||
    (typeof e.message === "string" && e.message.includes("User.employeeId"))
  );
}

type SalonUserLinkRow = {
  id: string;
  email: string;
  employeeId: string | null;
  role: string;
};

async function listSalonUsersForLinking(
  salonId: string
): Promise<SalonUserLinkRow[]> {
  try {
    return await prisma.user.findMany({
      where: { salonId, isActive: true },
      select: { id: true, email: true, employeeId: true, role: true },
    });
  } catch (error) {
    if (!isMissingEmployeeIdColumn(error)) throw error;
    const users = await prisma.user.findMany({
      where: { salonId, isActive: true },
      select: { id: true, email: true, role: true },
    });
    return users.map((user) => ({ ...user, employeeId: null }));
  }
}

/** Resolve the login user linked to a staff member (employeeId first, then email). */
export async function findLoginUserForEmployee(
  salonId: string,
  employee: { id: string; email: string | null }
) {
  try {
    const byLink = await prisma.user.findFirst({
      where: {
        salonId,
        isActive: true,
        employeeId: employee.id,
      },
      select: { id: true, name: true, email: true },
    });
    if (byLink) return byLink;
  } catch (error) {
    if (!isMissingEmployeeIdColumn(error)) throw error;
  }

  if (!employee.email) return null;

  return prisma.user.findFirst({
    where: {
      salonId,
      isActive: true,
      email: employee.email.toLowerCase(),
    },
    select: { id: true, name: true, email: true },
  });
}

/** Staff members eligible for a new login (no linked user yet). */
export async function getEmployeesAvailableForLogin(salonId: string) {
  const [employees, linkedUsers] = await Promise.all([
    prisma.employee.findMany({
      where: { salonId, status: { not: "inactive" } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
      },
      orderBy: { name: "asc" },
    }),
    listSalonUsersForLinking(salonId).then((users) =>
      users.filter((user) => user.role !== "owner")
    ),
  ]);

  const linkedEmployeeIds = new Set(
    linkedUsers
      .map((u) => u.employeeId)
      .filter((id): id is string => Boolean(id))
  );
  const takenEmails = new Set(
    linkedUsers.map((u) => u.email.toLowerCase())
  );

  return employees.filter((employee) => {
    if (linkedEmployeeIds.has(employee.id)) return false;
    if (
      employee.email &&
      takenEmails.has(employee.email.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
}

export type EmployeeLoginInfo = {
  userId: string;
  email: string;
  linkedBy: "employeeId" | "email";
};

/** Map employee id → login info (employeeId link first, email fallback). */
export async function getEmployeeLoginMap(salonId: string) {
  const [employees, users] = await Promise.all([
    prisma.employee.findMany({
      where: { salonId },
      select: { id: true, email: true },
    }),
    listSalonUsersForLinking(salonId),
  ]);

  const map = new Map<string, EmployeeLoginInfo>();

  for (const user of users) {
    if (user.role === "owner") continue;
    if (user.employeeId) {
      map.set(user.employeeId, {
        userId: user.id,
        email: user.email,
        linkedBy: "employeeId",
      });
    }
  }

  for (const employee of employees) {
    if (map.has(employee.id) || !employee.email) continue;
    const match = users.find(
      (u) =>
        u.role !== "owner" &&
        u.email.toLowerCase() === employee.email!.toLowerCase()
    );
    if (match) {
      map.set(employee.id, {
        userId: match.id,
        email: match.email,
        linkedBy: "email",
      });
    }
  }

  return map;
}

export async function findEmployeeLinkedToUser(
  salonId: string,
  user: { id: string; email: string; employeeId: string | null; role: string }
) {
  if (user.employeeId) {
    const employee = await prisma.employee.findFirst({
      where: { id: user.employeeId, salonId },
      select: { id: true, name: true, role: true },
    });
    if (employee) return employee;
  }

  if (user.role === "owner") return null;

  return prisma.employee.findFirst({
    where: {
      salonId,
      email: { equals: user.email, mode: "insensitive" },
    },
    select: { id: true, name: true, role: true },
  });
}
