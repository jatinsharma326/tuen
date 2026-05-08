import { HeroSection } from "@/components/landing/hero-section";
import { ArsenalSection } from "@/components/landing/arsenal-section";
import { ArchitectureSection } from "@/components/landing/architecture-section";
import { PlaygroundSection } from "@/components/landing/playground-section";
import { WallOfFameSection } from "@/components/landing/wall-of-fame-section";
import { DeploySection } from "@/components/landing/deploy-section";
import { CustomCursor } from "@/components/landing/custom-cursor";

export default function HomePage() {
  return (
    <div className="relative bg-[#0c0c12]">
      <CustomCursor />
      <HeroSection />
      <ArsenalSection />
      <ArchitectureSection />
      <PlaygroundSection />
      <WallOfFameSection />
      <DeploySection />

      {/* Footer */}
      <footer className="w-full border-t border-border-subtle bg-[#0c0c12] px-4 py-12 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-4">
            <span
              className="text-xl font-bold tracking-[0.15em] text-white"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              TUEN
            </span>
            <span
              className="text-[10px] text-text-muted"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              v2.4.0
            </span>
          </div>
          <div className="flex gap-6">
            {["Docs", "API", "Pricing", "Status", "GitHub"].map((link) => (
              <a
                key={link}
                href={`/${link.toLowerCase()}`}
                className="text-[11px] uppercase tracking-wider text-text-tertiary transition-colors hover:text-[#06b6d4]"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                {link}
              </a>
            ))}
          </div>
          <span
            className="text-[10px] text-text-muted"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            © 2025 TUEN. All systems nominal.
          </span>
        </div>
      </footer>
    </div>
  );
}
