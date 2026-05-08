import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyPolarSig } from "@/lib/payments/polar";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("polar-webhook-signature");
  const body = await req.text();

  if (!sig || !verifyPolarSig(body, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const event = JSON.parse(body);

    if (event?.type === "checkout.updated" && event?.data?.status === "succeeded") {
      const userId = event.data?.metadata?.userId;
      const planId = event.data?.metadata?.planId;

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
