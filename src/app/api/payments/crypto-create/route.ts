import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/services/auth";
import { createCoinbaseCharge } from "@/lib/payments/coinbase";
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

    const charge = await createCoinbaseCharge(plan.priceCents, plan.id, user.id);
    return NextResponse.json({ url: charge.hosted_url });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Crypto error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
