import { ModelGrid } from "@/components/models/model-grid";

export default function ModelsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24">
      <h1 className="font-display text-4xl font-bold tracking-tight">
        Model Gallery
      </h1>
      <p className="mt-4 text-lg text-text-tertiary">
        Browse and run the best AI models with a single API call.
      </p>
      <div className="mt-12">
        <ModelGrid />
      </div>
    </div>
  );
}
