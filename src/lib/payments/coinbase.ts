const COINBASE_API = "https://api.commerce.coinbase.com";

export async function createCoinbaseCharge(amountCents: number, planId: string, userId: string) {
  const key = process.env.COINBASE_COMMERCE_KEY;
  if (!key) throw new Error("Missing COINBASE_COMMERCE_KEY");

  const res = await fetch(`${COINBASE_API}/charges`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CC-Api-Key": key,
      "X-CC-Version": "2018-03-22",
    },
    body: JSON.stringify({
      name: `tuen.fun ${planId === "pro" ? "Pro" : ""} Plan`,
      description: "Monthly subscription to tuen.fun",
      pricing_type: "fixed_price",
      local_price: {
        amount: (amountCents / 100).toFixed(2),
        currency: "USD",
      },
      metadata: { userId, planId },
      redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?success=true`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Coinbase error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.data as {
    id: string;
    hosted_url: string;
    addresses: Record<string, string>;
  };
}

export function verifyCoinbaseSig(body: string, sig: string) {
  const secret = process.env.COINBASE_WEBHOOK_SECRET;
  if (!secret) throw new Error("Missing COINBASE_WEBHOOK_SECRET");

  const crypto = require("crypto") as typeof import("crypto");
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  const digest = hmac.digest("hex");
  return sig === digest;
}
