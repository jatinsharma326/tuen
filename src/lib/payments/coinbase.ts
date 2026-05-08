const NP_API = "https://api.nowpayments.io/v1";

export async function createCryptoInvoice(amountCents: number, planId: string, userId: string, origin: string) {
  const key = process.env.NOWPAYMENTS_API_KEY;
  if (!key) throw new Error("Missing NOWPAYMENTS_API_KEY");

  const res = await fetch(`${NP_API}/invoice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
    },
    body: JSON.stringify({
      price_amount: (amountCents / 100).toFixed(2),
      price_currency: "usd",
      order_id: `${userId}:${planId}:${Date.now()}`,
      order_description: `tuen.fun ${planId === "pro" ? "Pro" : ""} Plan`,
      success_url: `${origin}/dashboard/billing?success=true&plan=${planId}`,
      cancel_url: `${origin}/dashboard/billing?canceled=true`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`NOWPayments error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return { url: data.invoice_url as string, id: data.id as string };
}

export function verifyIpn(body: string, sig: string): boolean {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret) return false;

  const crypto = require("crypto") as typeof import("crypto");
  const hmac = crypto.createHmac("sha512", secret);
  hmac.update(body);
  return hmac.digest("hex") === sig;
}
