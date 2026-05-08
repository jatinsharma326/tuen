import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyCoinbaseSig } from "@/lib/payments/coinbase";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("x-cc-webhook-signature");
  const body = await req.text();

  if (!sig || !verifyCoinbaseSig(body, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const event = JSON.parse(body);
    if (event?.event?.type === "charge:confirmed") {
      const userId = event.event.data?.metadata?.userId;
      const planId = event.event.data?.metadata?.planId;

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
