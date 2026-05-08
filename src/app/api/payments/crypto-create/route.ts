import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/services/auth";
import { createCryptoInvoice } from "@/lib/payments/coinbase";
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
    const invoice = await createCryptoInvoice(plan.priceCents, plan.id, user.id, origin);
    return NextResponse.json({ url: invoice.url });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Crypto error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
