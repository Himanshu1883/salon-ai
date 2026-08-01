import "next-auth";
import type { PlatformRole } from "@/lib/platform-permissions";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      isSuperAdmin: boolean;
      platformRole?: PlatformRole;
      salonId?: string;
      salonName?: string;
      salonSlug?: string;
      plan?: string;
    };
  }

  interface User {
    role?: string;
    isSuperAdmin: boolean;
    platformRole?: PlatformRole | null;
    salonId?: string | null;
    salonName?: string | null;
    salonSlug?: string | null;
    plan?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    isSuperAdmin?: boolean;
    platformRole?: PlatformRole;
    salonId?: string;
    salonName?: string;
    salonSlug?: string;
    plan?: string;
  }
}
