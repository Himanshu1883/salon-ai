export default function StaffAnalyticsLoading() {
  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="h-10 w-48 animate-pulse rounded-xl bg-[#E8ECF4]" />
      <div className="h-28 animate-pulse rounded-[20px] bg-[#E8ECF4]" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-[20px] bg-[#E8ECF4]"
          />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="h-80 animate-pulse rounded-[20px] bg-[#E8ECF4] xl:col-span-2" />
        <div className="h-80 animate-pulse rounded-[20px] bg-[#E8ECF4]" />
      </div>
    </div>
  );
}
