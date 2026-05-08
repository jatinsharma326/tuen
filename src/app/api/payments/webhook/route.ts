import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/payments/stripe";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const body = await req.text();
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, sig, secret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;

      if (userId && planId) {
        const supabase = await createClient();
        await supabase.from("profiles").update({
          plan: planId,
          updated_at: new Date().toISOString(),
        }).eq("id", userId);
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
