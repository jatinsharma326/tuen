"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthInput } from "@/components/auth/auth-input";
import { OAuthButton } from "@/components/auth/oauth-button";
import { Mail, Lock, User, ArrowRight, Check } from "lucide-react";

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

function passwordScore(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH_LABEL = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLOR = ["#ef4444", "#ef4444", "#f59e0b", "#06b6d4", "#22c55e"];

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const score = passwordScore(password);

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
    <div className="space-y-7">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-6 bg-[#06b6d4]/50" />
          <span
            className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#06b6d4]/70"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Auth / Register
          </span>
        </div>
        <h1
          className="text-2xl font-semibold tracking-tight text-white"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Create your account
        </h1>
        <p className="text-[13px] text-white/40">
          Get <span className="text-[#c084fc]">50 free credits</span> to start building
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
          id="name"
          label="Full name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          icon={<User className="h-4 w-4" />}
        />
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
        <div className="space-y-2">
          <AuthInput
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            icon={<Lock className="h-4 w-4" />}
          />
          {password.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: i < score ? STRENGTH_COLOR[score] : "rgba(255,255,255,0.06)",
                    }}
                  />
                ))}
              </div>
              <p
                className="text-[10px] uppercase tracking-[0.15em]"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  color: STRENGTH_COLOR[score],
                  opacity: 0.7,
                }}
              >
                {STRENGTH_LABEL[score]}
              </p>
            </div>
          )}
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
              <span>Creating account…</span>
            </>
          ) : (
            <>
              <span>Create account</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        <ul className="space-y-1.5 pt-1">
          {[
            "50 free credits on signup",
            "No credit card required",
            "Cancel anytime",
          ].map((perk) => (
            <li
              key={perk}
              className="flex items-center gap-2 text-[12px] text-white/45"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              <Check className="h-3 w-3 text-[#06b6d4]" />
              {perk}
            </li>
          ))}
        </ul>

        <p className="pt-1 text-[11px] leading-relaxed text-white/30">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-white/50 underline-offset-2 hover:text-white/70 hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-white/50 underline-offset-2 hover:text-white/70 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <p className="text-center text-[13px] text-white/40">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-white/80 transition-colors hover:text-[#c084fc]"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
