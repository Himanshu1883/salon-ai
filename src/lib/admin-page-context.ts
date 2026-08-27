import { cache } from "react";
import { getAuthSession } from "@/lib/auth";
import {
  isSuperAdminRole,
  resolvePlatformRole,
  type PlatformRole,
} from "@/lib/platform-permissions";

/** One auth read per admin request (deduped via React cache). */
export const getAdminPageContext = cache(async () => {
  const session = await getAuthSession();
  const platformRole = resolvePlatformRole(session?.user ?? {});
  const superAdmin = isSuperAdminRole({
    platformRole,
    isSuperAdmin: session?.user?.isSuperAdmin,
  });

  return {
    session,
    platformRole: platformRole as PlatformRole | null,
    superAdmin,
    userName: session?.user?.name ?? "Admin",
  };
});
