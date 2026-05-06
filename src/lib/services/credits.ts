import { createClient } from "@/lib/supabase/server";

export async function getCredits(userId: string): Promise<number> {
  const supabase = await createClient();

  // Auto-reset monthly credits if needed
  const { data: resetData } = await supabase.rpc("reset_monthly_credits", {
    p_user_id: userId,
  });
  if (typeof resetData === "number") return resetData;

  const { data } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();
  return data?.credits ?? 0;
}

export async function deductCredits(userId: string, amount: number): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("deduct_credits", {
    p_user_id: userId,
    p_amount: amount,
  });
  return !error;
}

export async function logUsage(userId: string, service: string, credits: number) {
  const supabase = await createClient();
  await supabase.from("usage_logs").insert({
    user_id: userId,
    service,
    credits_used: credits,
  });
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

export async function refundCredits(userId: string, amount: number) {
  const supabase = await createClient();
  await supabase.rpc("refund_credits", { p_user_id: userId, p_amount: amount });
}

export async function getUserPlan(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("plan, credits, credits_reset_at")
    .eq("id", userId)
    .single();
  return data;
}
