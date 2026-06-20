import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export async function getAuthUser(supabase = createClient()): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Unable to fetch Supabase user", error.message);
      }
      return null;
    }

    return data.user ?? null;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Unable to fetch Supabase user", error);
    }
    return null;
  }
}
