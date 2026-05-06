import { MODELS } from "@/lib/constants/models";
import { PlaygroundLayout } from "@/components/playground/playground-layout";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ modelId: string }>;
}

export default async function ModelPlaygroundPage({ params }: Props) {
  const { modelId } = await params;
  const decoded = modelId.replace(/--/g, "/");
  const model = MODELS.find((m) => m.id === decoded);

  if (!model) return notFound();

  return (
    <div className="mx-auto max-w-7xl px-6 py-24">
      <PlaygroundLayout model={model} />
    </div>
  );
}
