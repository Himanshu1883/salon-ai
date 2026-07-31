import { cn, getInitials } from "@/lib/utils";

export function MemberAvatar({
  name,
  avatarUrl,
  className,
}: {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={cn(
          "h-9 w-9 shrink-0 rounded-full object-cover",
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-medium text-white",
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
