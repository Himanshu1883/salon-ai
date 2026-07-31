"use client";

export function ClientsLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-[#E8ECF4]" />
          <div className="h-4 w-72 rounded-lg bg-[#E8ECF4]" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-xl bg-[#E8ECF4]" />
          <div className="h-9 w-28 rounded-xl bg-[#E8ECF4]" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-[20px] border border-[#E8ECF4] bg-white"
          />
        ))}
      </div>
      <div className="h-24 rounded-[20px] bg-[#EDE9FE]/50" />
      <div className="h-10 rounded-xl bg-[#E8ECF4]" />
      <div className="h-96 rounded-[20px] border border-[#E8ECF4] bg-white" />
    </div>
  );
}
