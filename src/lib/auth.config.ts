import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role ?? "owner";
        token.isSuperAdmin = user.isSuperAdmin ?? false;
        token.salonId = user.salonId ?? undefined;
        token.salonName = user.salonName ?? undefined;
        token.salonSlug = user.salonSlug ?? undefined;
        token.plan = user.plan ?? undefined;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = (token.role as string | undefined) ?? "owner";
        session.user.isSuperAdmin = Boolean(token.isSuperAdmin);
        session.user.salonId = token.salonId as string | undefined;
        session.user.salonName = token.salonName as string | undefined;
        session.user.salonSlug = token.salonSlug as string | undefined;
        session.user.plan = token.plan as string | undefined;
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
