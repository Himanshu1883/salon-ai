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
import { salonLoginPath } from "@/lib/salon-paths";

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
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const salonSlug =
          typeof credentials?.salonSlug === "string" &&
          credentials.salonSlug.trim()
            ? credentials.salonSlug.trim()
            : undefined;

        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email: parsed.data.email },
            include: {
              salon: { select: { id: true, name: true, plan: true, slug: true } },
            },
          });
        } catch (error) {
          console.error("[auth] database unavailable during login:", error);
          throw new CredentialsSignin("DatabaseUnavailable");
        }

        if (!user) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.password);
        if (!valid) return null;

        if (user.isSuperAdmin) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isSuperAdmin: true,
            salonId: null,
            salonName: null,
            salonSlug: null,
            plan: null,
          };
        }

        if (!user.salon) return null;

        if (salonSlug && user.salon.slug !== salonSlug) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isSuperAdmin: false,
          salonId: user.salonId!,
          salonName: user.salon.name,
          salonSlug: user.salon.slug,
          plan: user.salon.plan,
        };
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
    include: {
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
  return salonSlug ? salonLoginPath(salonSlug) : "/";
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

  const user = await fetchSessionUser(session.user.id);

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
  if (!session?.user?.isSuperAdmin) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireOwnerOrManager() {
  const session = await requireSession();
  const role = session.user.role ?? "owner";

  if (role !== "owner" && role !== "manager") {
    throw new Error("Forbidden");
  }

  return session;
}
