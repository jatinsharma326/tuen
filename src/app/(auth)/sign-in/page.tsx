"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";

function generateKey() {
  return "tuen_sk_" + Array.from(crypto.getRandomValues(new Uint8Array(20)))
    .map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function ensureApiKey(supabase: ReturnType<typeof createClient>, userId: string) {
  const { count } = await supabase
    .from("api_keys")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (!count) {
    await supabase.from("api_keys").insert({
      user_id: userId,
      key: generateKey(),
      name: "Default",
    });
  }
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").upsert(
          { id: user.id, credits: 50, plan: "free" },
          { onConflict: "id", ignoreDuplicates: true }
        );
        await ensureApiKey(supabase, user.id);
      }
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium text-white">Sign in</h1>
        <p className="mt-1 text-[13px] text-white/30">Welcome back to tuen</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => handleOAuth("google")} className="rounded-md border border-white/[0.08] py-2 text-[13px] text-white/70 hover:border-white/[0.15] hover:text-white transition-colors">
          Google
        </button>
        <button onClick={() => handleOAuth("github")} className="rounded-md border border-white/[0.08] py-2 text-[13px] text-white/70 hover:border-white/[0.15] hover:text-white transition-colors">
          GitHub
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/[0.05]" />
        <span className="text-xs text-white/30">or</span>
        <div className="h-px flex-1 bg-white/[0.05]" />
      </div>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        {error && <p className="text-xs text-[#ef4444]">{error}</p>}
        <button disabled={loading} className="w-full rounded-md bg-white py-2 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-40 transition-colors">
          {loading ? "Signing in..." : "Continue"}
        </button>
      </form>
      <p className="text-center text-[13px] text-white/30">
        No account?{" "}
        <Link href="/sign-up" className="text-white/70 hover:text-white">Sign up</Link>
      </p>
    </div>
  );
}
