import { createClient } from "@/lib/supabase/server";
import { DEFAULT_PLAN } from "@/lib/constants/plans";

export type LimitKey = "image" | "tts" | "transcribe" | "llm";

function getWindowStart(period: "day" | "week" | "month"): string {
  const d = new Date();

  if (period === "day") {
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }
  if (period === "week") {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }
  // month
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function getUsageCounts(userId: string) {
  const supabase = await createClient();
  const dayStart = getWindowStart("day");
  const weekStart = getWindowStart("week");
  const monthStart = getWindowStart("month");

  const [{ count: dayTotal }, { count: weekTotal }, { count: monthTotal }] = await Promise.all([
    supabase.from("usage_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", dayStart),
    supabase.from("usage_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", weekStart),
    supabase.from("usage_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStart),
  ]);

  return {
    daily: dayTotal ?? 0,
    weekly: weekTotal ?? 0,
    monthly: monthTotal ?? 0,
  };
}

export async function checkServiceLimit(userId: string, limitKey: LimitKey): Promise<{ ok: boolean; error: string }> {
  const supabase = await createClient();
  const now = new Date();
  const dayStart = getWindowStart("day");
  const weekStart = getWindowStart("week");
  const monthStart = getWindowStart("month");

  const dayEnd = new Date(now);
  dayEnd.setHours(23, 59, 59, 999);

  const [{ count: dayCount }, { count: weekTotal }, { count: monthTotal }] = await Promise.all([
    supabase.from("usage_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("service", getServiceLogName(limitKey))
      .gte("created_at", dayStart),
    supabase.from("usage_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", weekStart),
    supabase.from("usage_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStart),
  ]);

  const d = (dayCount ?? 0);
  const w = weekTotal ?? 0;
  const m = monthTotal ?? 0;

  const dailyLimit = getDailyLimit(limitKey);
  if (d >= dailyLimit) {
    const resetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const hoursLeft = Math.max(1, Math.round((resetTime.getTime() - now.getTime()) / 3600000));
    return { ok: false, error: `Daily limit reached (${d}/${dailyLimit}). Resets in ~${hoursLeft}h.` };
  }

  if (w >= DEFAULT_PLAN.weeklyTotalLimit) {
    return { ok: false, error: `Weekly limit reached (${w}/${DEFAULT_PLAN.weeklyTotalLimit}).` };
  }

  if (m >= DEFAULT_PLAN.monthlyTotalLimit) {
    return { ok: false, error: `Monthly limit reached (${m}/${DEFAULT_PLAN.monthlyTotalLimit}).` };
  }

  return { ok: true, error: "" };
}

export async function checkRateLimit(userId: string, limitPerMin: number): Promise<boolean> {
  if (limitPerMin >= 9999) return true;
  const supabase = await createClient();
  const oneMinAgo = new Date(Date.now() - 60000).toISOString();
  const { count } = await supabase
    .from("usage_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneMinAgo);
  return (count ?? 0) < limitPerMin;
}

export async function logUsage(userId: string, service: string) {
  const supabase = await createClient();
  await supabase.from("usage_logs").insert({
    user_id: userId,
    service,
    credits_used: 1,
  });
}

export async function getUserPlan(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();
  return data;
}

function getDailyLimit(limitKey: LimitKey): number {
  switch (limitKey) {
    case "image": return DEFAULT_PLAN.dailyImageLimit;
    case "tts": return DEFAULT_PLAN.dailyTtsLimit;
    case "transcribe": return DEFAULT_PLAN.dailyTranscribeLimit;
    case "llm": return DEFAULT_PLAN.dailyLlmLimit;
  }
}

export function getServiceLogName(limitKey: LimitKey): string {
  switch (limitKey) {
    case "image": return "image_gen";
    case "tts": return "tts";
    case "transcribe": return "transcribe";
    case "llm": return "llm";
  }
}
