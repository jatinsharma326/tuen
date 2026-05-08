const POLAR_API = "https://api.polar.sh/v1";

export async function createPolarCheckout(priceCents: number, planId: string, userId: string, origin: string) {
  const token = process.env.POLAR_ACCESS_TOKEN;
  if (!token) throw new Error("Missing POLAR_ACCESS_TOKEN");

  const res = await fetch(`${POLAR_API}/checkouts/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      product_price_id: process.env.POLAR_PRICE_ID,
      success_url: `${origin}/dashboard/billing?success=true&plan=${planId}`,
      metadata: { userId, planId },
      amount: (priceCents * 100) || undefined,
      currency: "usd",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Polar error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return { url: data.url as string };
}

export function verifyPolarSig(body: string, sig: string): boolean {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) return false;

  const crypto = require("crypto") as typeof import("crypto");
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  return hmac.digest("hex") === sig;
}
