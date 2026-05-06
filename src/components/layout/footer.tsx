import Link from "next/link";

const COL1 = [
  { label: "Image Generation", href: "/sign-up" },
  { label: "Text to Speech", href: "/sign-up" },
  { label: "Transcription", href: "/sign-up" },
];

const COL2 = [
  { label: "Documentation", href: "/docs" },
  { label: "Pricing", href: "/pricing" },
  { label: "Dashboard", href: "/dashboard" },
];

const COL3 = [
  { label: "GitHub", href: "https://github.com" },
  { label: "Twitter", href: "https://twitter.com" },
  { label: "Discord", href: "https://discord.com" },
];

export function Footer() {
  return (
    <footer className="border-t border-border-subtle">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-8 sm:grid-cols-4">
          <div>
            <div className="flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-accent">
                <span className="text-[9px] font-bold text-surface-0">A</span>
              </div>
              <span className="font-display text-sm font-semibold">aiops</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-text-muted">
              AI inference API.<br />Pay per request.
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">Services</p>
            <ul className="mt-3 space-y-2">
              {COL1.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[13px] text-text-tertiary transition-colors hover:text-text-secondary">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">Developers</p>
            <ul className="mt-3 space-y-2">
              {COL2.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[13px] text-text-tertiary transition-colors hover:text-text-secondary">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">Community</p>
            <ul className="mt-3 space-y-2">
              {COL3.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-[13px] text-text-tertiary transition-colors hover:text-text-secondary">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex items-center justify-between border-t border-border-subtle pt-6">
          <span className="text-[12px] text-text-muted">&copy; {new Date().getFullYear()} aiops. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/" className="text-[12px] text-text-muted hover:text-text-tertiary">Privacy</Link>
            <Link href="/" className="text-[12px] text-text-muted hover:text-text-tertiary">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
