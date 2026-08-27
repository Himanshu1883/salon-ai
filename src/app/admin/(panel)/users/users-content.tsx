import { listPlatformUsersForPage } from "@/actions/platform-users";
import { UsersListClient } from "./users-list-client";

export async function AdminUsersContent() {
  const users = await listPlatformUsersForPage();
  return <UsersListClient users={users} />;
}
