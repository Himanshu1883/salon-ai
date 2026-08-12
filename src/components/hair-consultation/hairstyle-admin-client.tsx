"use client";

type Props = {
  hairstyles: {
    id: string;
    name: string;
    hairLength: string | null;
    isRecommended: boolean;
    isTrending: boolean;
    isActive: boolean;
    price: number | null;
    category: { name: string } | null;
  }[];
  categories: { id: string; name: string }[];
};

export function HairstyleAdminClient({ hairstyles, categories }: Props) {
  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <h1 className="text-xl font-bold text-[#0F172A]">AI Hairstyles</h1>
      <p className="mt-1 text-sm text-[#64748B]">
        Manage your salon&apos;s virtual try-on library.
      </p>
      <div className="mt-6 overflow-x-auto rounded-xl border border-[#ECECF5] bg-white">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-[#ECECF5] bg-[#FAFBFF] text-left text-xs uppercase text-[#64748B]">
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Length</th>
              <th className="p-3">Price</th>
              <th className="p-3">Flags</th>
            </tr>
          </thead>
          <tbody>
            {hairstyles.map((h) => (
              <tr key={h.id} className="border-b border-[#ECECF5]">
                <td className="p-3 font-medium">{h.name}</td>
                <td className="p-3 text-[#64748B]">{h.category?.name ?? "—"}</td>
                <td className="p-3">{h.hairLength ?? "—"}</td>
                <td className="p-3">{h.price != null ? `₹${h.price}` : "—"}</td>
                <td className="p-3 text-xs text-[#64748B]">
                  {h.isRecommended ? "Recommended " : ""}
                  {h.isTrending ? "Trending" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-[#64748B]">
        {categories.length} categories · Default styles are seeded on first consultation.
      </p>
    </div>
  );
}
