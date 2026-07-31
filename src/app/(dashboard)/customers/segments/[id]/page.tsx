import { redirect } from "next/navigation";

export default async function CustomerSegmentDetailRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/clients/segments/${id}`);
}
