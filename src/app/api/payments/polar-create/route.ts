import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/services/auth";
import { createPolarCheckout } from "@/lib/payments/polar";
import { getPlan } from "@/lib/constants/plans";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { planId } = await req.json();
    const plan = getPlan(planId);
    if (!plan || plan.priceCents === 0) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const checkout = await createPolarCheckout(plan.priceCents, plan.id, user.id, origin);
    return NextResponse.json({ url: checkout.url });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Polar error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
