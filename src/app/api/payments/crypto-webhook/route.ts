import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyIpn } from "@/lib/payments/coinbase";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("x-nowpayments-sig");
  const body = await req.text();

  if (!sig || !verifyIpn(body, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const event = JSON.parse(body);

    if (event?.payment_status === "finished") {
      const orderId = event?.order_id as string;
      const [userId, planId] = orderId?.split(":") ?? [];

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
