import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/services/auth";
import { capturePayPalOrder } from "@/lib/payments/paypal";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { orderID } = await req.json();
    if (!orderID) return NextResponse.json({ error: "Missing orderID" }, { status: 400 });

    const captureData = await capturePayPalOrder(orderID);

    const status = captureData?.status;
    const purchaseUnit = captureData?.purchase_units?.[0];
    const customId = purchaseUnit?.custom_id as string | undefined;
    const planId = customId?.split(":")[1];

    if (status !== "COMPLETED" || !planId) {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const supabase = await createClient();
    await supabase.from("profiles").update({ plan: planId, updated_at: new Date().toISOString() }).eq("id", user.id);

    return NextResponse.json({ success: true, plan: planId });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Capture error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
