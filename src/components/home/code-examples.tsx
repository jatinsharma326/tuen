"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Check, Copy, TerminalSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TABS = ["curl", "python", "javascript"] as const;

const CODE: Record<string, React.ReactNode> = {
  curl: (
    <>
      <span className="text-accent">curl</span> <span className="text-text-tertiary">-X POST</span> <span className="text-text-secondary">https://tuen.fun/api/v1/generate</span> \{"\n"}
      {"  "}<span className="text-text-tertiary">-H</span> <span className="text-emerald-500">"Authorization: Bearer sk_live_..."</span> \{"\n"}
      {"  "}<span className="text-text-tertiary">-H</span> <span className="text-emerald-500">"Content-Type: application/json"</span> \{"\n"}
      {"  "}<span className="text-text-tertiary">-d</span> <span className="text-accent-cyan">'{`{"model": "black-forest-labs/FLUX.1-schnell", "prompt": "a photo of a cat astronaut"}`}'</span>
    </>
  ),
  python: (
    <>
      <span className="text-accent">import</span> requests{"\n\n"}
      res = requests.<span className="text-accent-blue">post</span>({"\n"}
      {"    "}<span className="text-emerald-500">"https://tuen.fun/api/v1/generate"</span>,{"\n"}
      {"    "}headers=<span className="text-accent">{`{"Authorization"`}</span>: <span className="text-emerald-500">"Bearer sk_live_..."</span>{`}`},{"\n"}
      {"    "}json=<span className="text-accent">{`{"model"`}</span>: <span className="text-emerald-500">"black-forest-labs/FLUX.1-schnell"</span>, <span className="text-accent">"prompt"</span>: <span className="text-emerald-500">"a photo of a cat astronaut"</span>{`}`}{"\n"}
      ){"\n\n"}
      <span className="text-accent-blue">print</span>(res.json()[<span className="text-emerald-500">"url"</span>])
    </>
  ),
  javascript: (
    <>
      <span className="text-accent">import</span> {`{ tuen }`} <span className="text-accent">from</span> <span className="text-emerald-500">"@tuen/client"</span>;{"\n\n"}
      <span className="text-accent">const</span> res = <span className="text-accent">await</span> tuen.<span className="text-accent-blue">generate</span>({"\n"}
      {"  "}model: <span className="text-emerald-500">"black-forest-labs/FLUX.1-schnell"</span>,{"\n"}
      {"  "}prompt: <span className="text-emerald-500">"a photo of a cat astronaut"</span>,{"\n"}
      {`});`}{"\n\n"}
      console.<span className="text-accent-blue">log</span>(res.url);
    </>
  ),
};

const RAW_CODE: Record<string, string> = {
  curl: `curl -X POST https://tuen.fun/api/v1/generate \\n  -H "Authorization: Bearer sk_live_..." \\n  -H "Content-Type: application/json" \\n  -d '{"model": "black-forest-labs/FLUX.1-schnell", "prompt": "a photo of a cat astronaut"}'`,
  python: `import requests\n\nres = requests.post(\n    "https://tuen.fun/api/v1/generate",\n    headers={"Authorization": "Bearer sk_live_..."},\n    json={"model": "black-forest-labs/FLUX.1-schnell", "prompt": "a photo of a cat astronaut"}\n)\n\nprint(res.json()["url"])`,
  javascript: `import { tuen } from "@tuen/client";\n\nconst res = await tuen.generate({\n  model: "black-forest-labs/FLUX.1-schnell",\n  prompt: "a photo of a cat astronaut",\n});\n\nconsole.log(res.url);`,
};

export function CodeExamples() {
  const [active, setActive] = useState<string>("curl");
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(RAW_CODE[active]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="mx-auto max-w-5xl px-5 py-32">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-1 px-3 py-1 mb-6"
          >
            <TerminalSquare size={14} className="text-accent" />
            <span className="text-[12px] font-medium text-text-secondary">Developer Experience</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl font-extrabold tracking-tight md:text-5xl text-text-primary mb-6"
          >
            The easiest API <br/>
            <span className="text-text-muted">you'll ever use</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[16px] leading-relaxed text-text-secondary"
          >
            No complex setup, no GPU clusters to manage. One unified API for image, audio, and video models. Authenticate once and generate anything.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-accent to-accent-blue rounded-xl blur opacity-15" />
          <div className="relative overflow-hidden rounded-xl border border-border-subtle glass-panel shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 bg-[#0a0a0a] px-2 pt-2">
              <div className="flex px-2 space-x-2">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActive(tab)}
                    className={cn(
                      "relative px-4 py-2 text-[13px] transition-colors rounded-t-md font-medium font-mono",
                      active === tab
                        ? "text-white bg-white/5"
                        : "text-text-muted hover:text-text-secondary",
                    )}
                  >
                    {tab}
                    {active === tab && (
                      <motion.span 
                        layoutId="activeTab"
                        className="absolute top-0 left-0 right-0 h-[2px] bg-accent" 
                      />
                    )}
                  </button>
                ))}
              </div>
              <button 
                onClick={copy} 
                className="mb-2 mr-2 rounded-md p-2 text-text-muted hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Copy code"
              >
                {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              </button>
            </div>
            <div className="bg-[#050505] p-6 font-mono text-[13px] leading-[1.7] overflow-x-auto">
              <AnimatePresence mode="wait">
                <motion.pre
                  key={active}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  <code>{CODE[active]}</code>
                </motion.pre>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
