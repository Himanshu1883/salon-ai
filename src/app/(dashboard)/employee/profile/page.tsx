import { redirect } from "next/navigation";
import { getOwnEmployeeProfile } from "@/actions/team";
import { MemberAvatar } from "@/components/team/member-avatar";
import { getRoleLabel } from "@/lib/team";
import { format } from "date-fns";

export default async function EmployeeProfilePage() {
  const profile = await getOwnEmployeeProfile();
  if (!profile) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-[#1C103D]">My Profile</h1>
      <div className="rounded-[20px] border border-[#E8ECF4] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <MemberAvatar
            name={profile.name}
            avatarUrl={profile.avatarUrl}
            className="h-16 w-16 text-lg"
          />
          <div>
            <p className="text-xl font-semibold">{profile.name}</p>
            <p className="text-sm text-[#6B7280]">{getRoleLabel(profile.role)}</p>
          </div>
        </div>
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[#6B7280]">Phone</dt>
            <dd className="font-medium">{profile.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[#6B7280]">Email</dt>
            <dd className="font-medium">{profile.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[#6B7280]">Status</dt>
            <dd className="font-medium capitalize">{profile.status}</dd>
          </div>
          <div>
            <dt className="text-[#6B7280]">Joined</dt>
            <dd className="font-medium">
              {format(profile.createdAt, "d MMM yyyy")}
            </dd>
          </div>
        </dl>
        <div className="mt-6">
          <p className="text-sm text-[#6B7280]">Assigned services</p>
          {profile.services.length === 0 ? (
            <p className="mt-2 text-sm text-[#9CA3AF]">No services assigned</p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-2">
              {profile.services.map((row) => (
                <li
                  key={row.service.id}
                  className="rounded-full bg-[#F5F3FF] px-3 py-1 text-xs font-medium text-[#6C3BFF]"
                >
                  {row.service.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
