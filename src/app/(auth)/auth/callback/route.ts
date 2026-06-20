import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/dashboard";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  const origin = isLocalEnv
    ? request.nextUrl.origin
    : forwardedHost
      ? `https://${forwardedHost}`
      : request.nextUrl.origin;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const finalOrigin = siteUrl || origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("profiles").upsert(
          { id: user.id, plan: "trial" },
          { onConflict: "id", ignoreDuplicates: true }
        );
      }
    }
  }

  return NextResponse.redirect(`${finalOrigin}${redirect}`);
}
