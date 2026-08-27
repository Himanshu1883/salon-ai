function AdminPanelSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded-lg bg-stone-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-36 rounded-2xl bg-stone-100" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-stone-100" />
    </div>
  );
}

export default function AdminPanelLoading() {
  return <AdminPanelSkeleton />;
}
