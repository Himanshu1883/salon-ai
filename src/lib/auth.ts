import { cache } from "react";
import { redirect } from "next/navigation";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { authConfig } from "@/lib/auth.config";
import { normalizeSalonPlan, type SalonPlan } from "@/lib/plans";
import { signOutCallbackUrl } from "@/lib/salon-paths";
import { consumeAdminImpersonationToken } from "@/lib/platform-admin-access";
import type { PlatformRole } from "@/lib/platform-permissions";
import { resolvePlatformRole } from "@/lib/platform-permissions";
import { warmDatabasePool } from "@/lib/warm-database-pool";

const loginUserSelect = {
  id: true,
  email: true,
  name: true,
  password: true,
  role: true,
  isActive: true,
  isSuperAdmin: true,
  platformRole: true,
  salonId: true,
  employeeId: true,
  employee: { select: { status: true } },
  salon: {
    select: { id: true, name: true, plan: true, slug: true },
  },
} as const;

type LoginUser = {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  platformRole: PlatformRole | null;
  salonId: string | null;
  employeeId: string | null;
  employee: { status: string } | null;
  salon: {
    id: string;
    name: string;
    plan: string;
    slug: string;
  } | null;
};

function toSalonSession(user: LoginUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isSuperAdmin: false,
    salonId: user.salonId!,
    salonName: user.salon!.name,
    salonSlug: user.salon!.slug,
    plan: user.salon!.plan,
    dashboardAccessVerified: true,
  };
}

async function isStaffLoginAllowed(user: LoginUser): Promise<boolean> {
  if (user.role === "owner") return true;

  const linkedStatus = user.employee?.status ?? null;
  if (linkedStatus === "inactive") return false;
  if (linkedStatus) return true;

  if (!user.salonId) return true;

  const fallbackEmployee = await prisma.employee.findFirst({
    where: user.employeeId
      ? { id: user.employeeId, salonId: user.salonId }
      : {
          salonId: user.salonId,
          email: { equals: user.email, mode: "insensitive" as const },
        },
    select: { status: true },
  });

  return fallbackEmployee?.status !== "inactive";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        salonSlug: {},
        impersonationToken: {},
      },
      authorize: async (credentials) => {
        await warmDatabasePool();

        const impersonationToken =
          typeof credentials?.impersonationToken === "string" &&
          credentials.impersonationToken.trim()
            ? credentials.impersonationToken.trim()
            : undefined;

        if (impersonationToken) {
          const impersonation =
            await consumeAdminImpersonationToken(impersonationToken);
          if (!impersonation) return null;

          const { owner } = impersonation;
          return {
            id: owner.id,
            email: owner.email,
            name: owner.name,
            role: owner.role,
            isSuperAdmin: false,
            salonId: owner.salonId!,
            salonName: owner.salon!.name,
            salonSlug: owner.salon!.slug,
            plan: owner.salon!.plan,
            dashboardAccessVerified: true,
          };
        }

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[auth] invalid login payload", parsed.error.flatten());
          }
          return null;
        }

        const salonSlug =
          typeof credentials?.salonSlug === "string" &&
          credentials.salonSlug.trim()
            ? credentials.salonSlug.trim()
            : undefined;

        let user: LoginUser | null;
        try {
          user = (await prisma.user.findUnique({
            where: { email: parsed.data.email },
            select: loginUserSelect,
          })) as LoginUser | null;
        } catch (error) {
          console.error("[auth] database unavailable during login:", error);
          const authError = new CredentialsSignin();
          authError.code = "database_unavailable";
          throw authError;
        }

        if (!user) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[auth] no user found for", parsed.data.email);
          }
          return null;
        }

        if (salonSlug && (!user.salon || user.salon.slug !== salonSlug)) {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "[auth] salon slug mismatch",
              parsed.data.email,
              salonSlug
            );
          }
          return null;
        }

        const valid = await bcrypt.compare(parsed.data.password, user.password);
        if (!valid) {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "[auth] invalid password for",
              parsed.data.email,
              `(length ${parsed.data.password.length})`
            );
          }
          return null;
        }

        if (!user.isActive) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[auth] inactive user", parsed.data.email);
          }
          return null;
        }

        /** Salon-branded login (`/{slug}/login`) must always open that salon workspace. */
        if (salonSlug) {
          if (!(await isStaffLoginAllowed(user))) {
            if (process.env.NODE_ENV === "development") {
              console.warn("[auth] inactive team member", parsed.data.email);
            }
            return null;
          }

          return toSalonSession(user);
        }

        const platformRole: PlatformRole | null =
          user.platformRole ?? (user.isSuperAdmin ? "SUPER_ADMIN" : null);

        if (platformRole) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isSuperAdmin: platformRole === "SUPER_ADMIN",
            platformRole,
            salonId: null,
            salonName: null,
            salonSlug: null,
            plan: null,
          };
        }

        if (!user.salon) return null;

        if (!(await isStaffLoginAllowed(user))) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[auth] inactive team member", parsed.data.email);
          }
          return null;
        }

        return toSalonSession(user);
      },
    }),
  ],
});

/** Deduplicate auth() within a single server request. */
export const getAuthSession = cache(auth);

/** DB fallback only when JWT lacks salon context (deduped per request). */
const fetchSessionUser = cache(async (userId: string) =>
  prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      salonId: true,
      salon: { select: { id: true, name: true, plan: true, slug: true } },
    },
  })
);

type SalonSessionUser = {
  salonId: string;
  salonName: string;
  salonSlug: string;
  role: string;
  plan: SalonPlan;
};

function loginRedirectPath(salonSlug?: string | null) {
  return signOutCallbackUrl({ salonSlug });
}

export async function requireSession() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/");
  }

  if (
    session.user.salonId &&
    session.user.salonName &&
    session.user.salonSlug &&
    session.user.plan &&
    !session.user.isSuperAdmin
  ) {
    return {
      ...session,
      user: {
        ...session.user,
        salonId: session.user.salonId,
        salonName: session.user.salonName,
        salonSlug: session.user.salonSlug,
        role: session.user.role ?? "owner",
        plan: normalizeSalonPlan(session.user.plan),
      },
    } as typeof session & { user: typeof session.user & SalonSessionUser };
  }

  let user: Awaited<ReturnType<typeof fetchSessionUser>> = null;
  try {
    user = await fetchSessionUser(session.user.id);
  } catch (error) {
    if (
      session.user.salonId &&
      session.user.salonName &&
      session.user.salonSlug
    ) {
      console.warn("[auth] session lookup failed, using JWT salon context");
      return {
        ...session,
        user: {
          ...session.user,
          salonId: session.user.salonId,
          salonName: session.user.salonName,
          salonSlug: session.user.salonSlug,
          role: session.user.role ?? "owner",
          plan: normalizeSalonPlan(session.user.plan),
        },
      } as typeof session & { user: typeof session.user & SalonSessionUser };
    }
    throw error;
  }

  if (!user?.salonId || !user.salon) {
    redirect(loginRedirectPath(session.user.salonSlug));
  }

  const plan = normalizeSalonPlan(user.salon.plan);

  if (
    session.user.salonId &&
    session.user.salonName &&
    session.user.salonSlug &&
    !session.user.isSuperAdmin
  ) {
    return {
      ...session,
      user: {
        ...session.user,
        salonId: session.user.salonId,
        salonName: session.user.salonName,
        salonSlug: session.user.salonSlug,
        role: session.user.role ?? "owner",
        plan,
      },
    } as typeof session & { user: typeof session.user & SalonSessionUser };
  }

  return {
    ...session,
    user: {
      ...session.user,
      salonId: user.salonId,
      salonName: user.salon.name,
      salonSlug: user.salon.slug,
      role: user.role ?? "owner",
      plan,
    },
  } as typeof session & { user: typeof session.user & SalonSessionUser };
}

export async function requireSuperAdmin() {
  const session = await getAuthSession();
  const platformRole = resolvePlatformRole(session?.user ?? {});
  if (platformRole !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
  return session!;
}

export async function requirePlatformAdmin() {
  const session = await getAuthSession();
  const platformRole = resolvePlatformRole(session?.user ?? {});
  if (!platformRole) {
    throw new Error("Unauthorized");
  }
  return session!;
}

export async function requireOwnerOrManager() {
  const session = await requireSession();
  const role = session.user.role ?? "owner";

  if (role !== "owner" && role !== "manager") {
    throw new Error("Forbidden");
  }

  return session;
}
