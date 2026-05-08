import { createServiceClient } from "@/lib/supabase/server";
import { getPlan, type Plan } from "@/lib/constants/plans";

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
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function fetchUserPlan(userId: string): Promise<Plan> {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();
  return getPlan(data?.plan || "trial");
}

export async function getUsageCounts(userId: string) {
  const supabase = await createServiceClient();
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
  const plan = await fetchUserPlan(userId);
  const supabase = await createServiceClient();
  const now = new Date();
  const dayStart = getWindowStart("day");
  const weekStart = getWindowStart("week");
  const monthStart = getWindowStart("month");

  const serviceLogName = getServiceLogName(limitKey);

  const [{ count: dayCount }, { count: weekTotal }, { count: monthTotal }] = await Promise.all([
    supabase.from("usage_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("service", serviceLogName)
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

  const dailyLimit = getPlanDailyLimit(plan, limitKey);
  if (d >= dailyLimit) {
    const resetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const hoursLeft = Math.max(1, Math.round((resetTime.getTime() - now.getTime()) / 3600000));
    return { ok: false, error: `Daily limit reached (${d}/${dailyLimit}). Resets in ~${hoursLeft}h.` };
  }

  if (w >= plan.weeklyTotalLimit) {
    return { ok: false, error: `Weekly limit reached (${w}/${plan.weeklyTotalLimit}).` };
  }

  if (m >= plan.monthlyTotalLimit) {
    return { ok: false, error: `Monthly limit reached (${m}/${plan.monthlyTotalLimit}).` };
  }

  return { ok: true, error: "" };
}

export async function checkRateLimit(userId: string, limitPerMin: number): Promise<boolean> {
  if (limitPerMin >= 9999) return true;
  const supabase = await createServiceClient();
  const oneMinAgo = new Date(Date.now() - 60000).toISOString();
  const { count } = await supabase
    .from("usage_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneMinAgo);
  return (count ?? 0) < limitPerMin;
}

export async function logUsage(userId: string, service: string) {
  const supabase = await createServiceClient();
  await supabase.from("usage_logs").insert({
    user_id: userId,
    service,
    credits_used: 1,
  });
}

export async function getUserPlan(userId: string) {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();
  return data;
}

function getPlanDailyLimit(plan: Plan, limitKey: LimitKey): number {
  switch (limitKey) {
    case "image": return plan.dailyImageLimit;
    case "tts": return plan.dailyTtsLimit;
    case "transcribe": return plan.dailyTranscribeLimit;
    case "llm": return plan.dailyLlmLimit;
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
