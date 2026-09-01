export default function SalesAppointmentsLoading() {
  return (
    <div className="-mx-4 space-y-6 bg-[#F7F8FC] px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="h-9 w-48 animate-pulse rounded-lg bg-[#E8ECF4]" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-[#E8ECF4]" />
        </div>
        <div className="flex gap-2">
          <div className="h-11 w-28 animate-pulse rounded-2xl bg-[#E8ECF4]" />
          <div className="h-11 w-40 animate-pulse rounded-2xl bg-[#E8ECF4]" />
        </div>
      </div>
      <div className="h-16 animate-pulse rounded-[20px] bg-white" />
      <div className="h-[520px] animate-pulse rounded-[20px] border border-[#E8ECF4] bg-white" />
    </div>
  );
}
