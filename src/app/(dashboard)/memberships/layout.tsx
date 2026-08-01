import { MembershipsSubNav } from "@/components/memberships/memberships-shell";

export default function MembershipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <MembershipsSubNav />
      {children}
    </div>
  );
}
