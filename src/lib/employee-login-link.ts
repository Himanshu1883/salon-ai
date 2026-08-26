import { prisma } from "@/lib/prisma";
import { cachedRead } from "@/lib/memory-cache";

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
  isActive: boolean;
};

async function listSalonStaffLogins(
  salonId: string,
  options?: { activeOnly?: boolean }
): Promise<SalonUserLinkRow[]> {
  const where = {
    salonId,
    role: { not: "owner" as const },
    ...(options?.activeOnly ? { isActive: true } : {}),
  };

  try {
    return await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        employeeId: true,
        role: true,
        isActive: true,
      },
    });
  } catch (error) {
    if (!isMissingEmployeeIdColumn(error)) throw error;
    const users = await prisma.user.findMany({
      where,
      select: { id: true, email: true, role: true, isActive: true },
    });
    return users.map((user) => ({ ...user, employeeId: null }));
  }
}

/** All login accounts linked to a team member (by employeeId or email). */
export async function findLinkedLoginUsersForEmployee(
  salonId: string,
  employee: { id: string; email: string | null },
  options?: { activeOnly?: boolean }
) {
  const users = await listSalonStaffLogins(salonId, options);
  const linked = users.filter((user) => {
    if (user.employeeId === employee.id) return true;
    if (
      employee.email &&
      user.email.toLowerCase() === employee.email.toLowerCase()
    ) {
      return true;
    }
    return false;
  });
  const byId = new Map(linked.map((user) => [user.id, user]));
  return Array.from(byId.values());
}

/** Enable or disable dashboard login for a team member's linked account(s). */
export async function setLinkedLoginActiveState(
  salonId: string,
  employee: { id: string; email: string | null },
  isActive: boolean
): Promise<string[]> {
  const linked = await findLinkedLoginUsersForEmployee(salonId, employee);
  const userIds = linked.map((user) => user.id);
  if (userIds.length === 0) return [];

  await prisma.user.updateMany({
    where: { id: { in: userIds }, salonId },
    data: { isActive },
  });

  return userIds;
}

async function listSalonUsersForLinking(
  salonId: string
): Promise<SalonUserLinkRow[]> {
  return listSalonStaffLogins(salonId, { activeOnly: true });
}

/** Resolve the login user linked to a staff member (employeeId first, then email). */
export async function findLoginUserForEmployee(
  salonId: string,
  employee: { id: string; email: string | null }
) {
  const linked = await findLinkedLoginUsersForEmployee(salonId, employee, {
    activeOnly: true,
  });
  const user = linked[0];
  if (!user) return null;
  return prisma.user.findFirst({
    where: { id: user.id, salonId },
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
  loginActive: boolean;
};

/** Map employee id → login info (employeeId link first, email fallback). */
export async function getEmployeeLoginMap(salonId: string) {
  const [employees, users] = await Promise.all([
    prisma.employee.findMany({
      where: { salonId },
      select: { id: true, email: true, status: true },
    }),
    listSalonStaffLogins(salonId),
  ]);

  const map = new Map<string, EmployeeLoginInfo>();

  for (const user of users) {
    if (user.employeeId) {
      map.set(user.employeeId, {
        userId: user.id,
        email: user.email,
        linkedBy: "employeeId",
        loginActive: user.isActive,
      });
    }
  }

  for (const employee of employees) {
    if (map.has(employee.id) || !employee.email) continue;
    const match = users.find(
      (u) => u.email.toLowerCase() === employee.email!.toLowerCase()
    );
    if (match) {
      map.set(employee.id, {
        userId: match.id,
        email: match.email,
        linkedBy: "email",
        loginActive: match.isActive,
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

/** Block dashboard access when login or linked staff profile is inactive. */
export async function isStaffDashboardAccessAllowed(
  salonId: string,
  user: { id: string; email: string; role: string; employeeId?: string | null }
) {
  if (user.role === "owner") return true;

  return cachedRead(
    `staff-access:${salonId}:${user.id}`,
    120,
    () => checkStaffDashboardAccessAllowed(salonId, user)
  );
}

async function checkStaffDashboardAccessAllowed(
  salonId: string,
  user: { id: string; email: string; role: string; employeeId?: string | null }
) {
  try {
    const account = await prisma.user.findFirst({
      where: { id: user.id, salonId },
      select: {
        isActive: true,
        email: true,
        employeeId: true,
        employee: { select: { status: true } },
      },
    });

    if (!account?.isActive) return false;

    if (account.employee?.status === "inactive") return false;

    if (!account.employee && account.email) {
      const byEmail = await prisma.employee.findFirst({
        where: {
          salonId,
          email: { equals: account.email, mode: "insensitive" },
        },
        select: { status: true },
      });
      if (byEmail?.status === "inactive") return false;
    }

    return true;
  } catch (error) {
    if (!isMissingEmployeeIdColumn(error)) throw error;

    const account = await prisma.user.findFirst({
      where: { id: user.id, salonId },
      select: { isActive: true, email: true },
    });
    if (!account?.isActive) return false;

    if (account.email) {
      const byEmail = await prisma.employee.findFirst({
        where: {
          salonId,
          email: { equals: account.email, mode: "insensitive" },
        },
        select: { status: true },
      });
      if (byEmail?.status === "inactive") return false;
    }

    return true;
  }
}
