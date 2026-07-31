import { getAiSchedulingContext } from "@/actions/ai-scheduling";
import { AiSchedulingClient } from "./ai-scheduling-client";

export default async function AiSchedulingPage() {
  const context = await getAiSchedulingContext();
  return <AiSchedulingClient {...context} />;
}
