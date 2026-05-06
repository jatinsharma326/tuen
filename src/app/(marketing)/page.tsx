import { HeroSection } from "@/components/home/hero-section";
import { StatsSection } from "@/components/home/stats-section";
import { FeaturesSection } from "@/components/home/features-section";
import { ModelsPreview } from "@/components/home/models-preview";
import { CodeExamples } from "@/components/home/code-examples";
import { CtaSection } from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <ModelsPreview />
      <CodeExamples />
      <CtaSection />
    </>
  );
}
