"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, getAuthUser } from "@/lib/supabase/client";
import { AuthInput } from "@/components/auth/auth-input";
import { OAuthButton } from "@/components/auth/oauth-button";
import { Mail, Lock, ArrowRight } from "lucide-react";

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
      const user = await getAuthUser(supabase);
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
    <div className="space-y-7">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-6 bg-[#c084fc]/50" />
          <span
            className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#c084fc]/70"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Auth / Login
          </span>
        </div>
        <h1
          className="text-2xl font-semibold tracking-tight text-white"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Welcome back
        </h1>
        <p className="text-[13px] text-white/40">
          Sign in to your account to continue
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <OAuthButton provider="google" onClick={() => handleOAuth("google")} disabled={loading} />
        <OAuthButton provider="github" onClick={() => handleOAuth("github")} disabled={loading} />
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/[0.08]" />
        <span
          className="text-[10px] uppercase tracking-[0.25em] text-white/30"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          or with email
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/[0.08]" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthInput
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
        />
        <AuthInput
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4" />}
        />

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-[12px] text-white/50 hover:text-white/70 cursor-pointer">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 text-[#c084fc] focus:ring-1 focus:ring-[#c084fc]/40 focus:ring-offset-0"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-[12px] text-white/50 transition-colors hover:text-[#c084fc]"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <div className="rounded-lg border border-[#ef4444]/20 bg-[#ef4444]/[0.06] px-3 py-2.5">
            <p
              className="flex items-center gap-2 text-[12px] text-[#ef4444]"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ef4444]" />
              {error}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-b from-[#c084fc] to-[#9333ea] text-sm font-semibold text-white shadow-lg shadow-[#c084fc]/20 transition-all hover:shadow-[#c084fc]/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          {loading ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>Signing in…</span>
            </>
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-[13px] text-white/40">
        New here?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-white/80 transition-colors hover:text-[#c084fc]"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
