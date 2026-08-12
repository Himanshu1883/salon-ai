import { notFound } from "next/navigation";
import { getHairConsultation } from "@/actions/hair-consultations";
import { ConsultationWorkspace } from "@/components/hair-consultation/consultation-workspace";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function HairConsultationSessionPage({ params }: Props) {
  const { id } = await params;
  const result = await getHairConsultation(id);
  if (result.error || !result.consultation) notFound();

  return (
    <ConsultationWorkspace
      consultation={result.consultation as Parameters<typeof ConsultationWorkspace>[0]["consultation"]}
      disclaimer={result.disclaimer}
    />
  );
}
