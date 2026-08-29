import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
    updateAge: 60 * 60,
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role ?? "owner";
        token.isSuperAdmin = user.isSuperAdmin ?? false;
        token.platformRole = user.platformRole ?? undefined;
        token.salonId = user.salonId ?? undefined;
        token.salonName = user.salonName ?? undefined;
        token.salonSlug = user.salonSlug ?? undefined;
        token.plan = user.plan ?? undefined;
        token.dashboardAccessVerified = user.dashboardAccessVerified ?? undefined;
      }

      // Salon workspace sessions must never carry platform-admin flags.
      if (token.salonId) {
        token.isSuperAdmin = false;
        token.platformRole = undefined;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = (token.role as string | undefined) ?? "owner";
        session.user.salonId = token.salonId as string | undefined;
        session.user.salonName = token.salonName as string | undefined;
        session.user.salonSlug = token.salonSlug as string | undefined;
        session.user.plan = token.plan as string | undefined;
        session.user.dashboardAccessVerified =
          token.dashboardAccessVerified === true;

        if (session.user.salonId) {
          session.user.isSuperAdmin = false;
          session.user.platformRole = undefined;
        } else {
          session.user.isSuperAdmin = Boolean(token.isSuperAdmin);
          session.user.platformRole = token.platformRole as
            | import("@/lib/platform-permissions").PlatformRole
            | undefined;
        }
      }
      return session;
    },
    authorized: async ({ auth }) => {
      return !!auth?.user;
    },
    redirect: async ({ url, baseUrl }) => {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
