import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/services/auth";
import { createPayPalOrder } from "@/lib/payments/paypal";
import { getPlan, PLANS } from "@/lib/constants/plans";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { planId } = await req.json();
    const plan = getPlan(planId);
    if (!plan || plan.priceCents === 0) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const order = await createPayPalOrder(plan.priceCents, plan.id, user.id);
    return NextResponse.json({ orderID: order.id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Payment error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
