import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function getAuthUser(req: Request) {
  const authHeader = req.headers.get("authorization");

  // ── API Key auth (for external services like n8n) ──
  if (authHeader?.startsWith("Bearer tuen_sk_")) {
    const key = authHeader.replace("Bearer ", "").trim();
    const supabase = await createServiceClient();

    const { data } = await supabase
      .from("api_keys")
      .select("user_id, id")
      .eq("key", key)
      .single();

    if (!data) return null;

    supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", data.id)
      .then(() => {});

    return { id: data.user_id };
  }

  // ── Session cookie auth (for dashboard users) ──
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ? { id: data.user.id } : null;
}
