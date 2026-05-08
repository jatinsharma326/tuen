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

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      if (authData.user) {
        await supabase.from("profiles").upsert(
          { id: authData.user.id, credits: 50, plan: "free" },
          { onConflict: "id", ignoreDuplicates: true }
        );
        await ensureApiKey(supabase, authData.user.id);
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
        <h1 className="text-lg font-medium text-text-primary">Create account</h1>
        <p className="mt-1 text-[13px] text-text-muted">Start building with AI in minutes</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => handleOAuth("google")} className="rounded-md border border-border-default py-2 text-[13px] text-text-secondary hover:border-border-strong hover:text-text-primary transition-colors">
          Google
        </button>
        <button onClick={() => handleOAuth("github")} className="rounded-md border border-border-default py-2 text-[13px] text-text-secondary hover:border-border-strong hover:text-text-primary transition-colors">
          GitHub
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border-subtle" />
        <span className="text-xs text-text-muted">or</span>
        <div className="h-px flex-1 bg-border-subtle" />
      </div>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input id="name" label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
        <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        {error && <p className="text-xs text-error">{error}</p>}
        <button disabled={loading} className="btn-white w-full rounded-md py-2 text-sm disabled:opacity-40 transition-colors">
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
      <p className="text-center text-[13px] text-text-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-text-secondary hover:text-text-primary">Sign in</Link>
      </p>
    </div>
  );
}
