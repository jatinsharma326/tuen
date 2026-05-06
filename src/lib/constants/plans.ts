export interface Plan {
  id: string;
  name: string;
  priceCents: number;
  monthlyCredits: number;
  maxApiKeys: number;
  rateLimitPerMin: number;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceCents: 0,
    monthlyCredits: 50,
    maxApiKeys: 1,
    rateLimitPerMin: 5,
    features: ["50 credits/month", "1 API key", "5 requests/min", "Community support"],
  },
  {
    id: "starter",
    name: "Starter",
    priceCents: 500,
    monthlyCredits: 1000,
    maxApiKeys: 3,
    rateLimitPerMin: 20,
    features: ["1,000 credits/month", "3 API keys", "20 requests/min", "Email support"],
  },
  {
    id: "pro",
    name: "Pro",
    priceCents: 1900,
    monthlyCredits: 5000,
    maxApiKeys: 10,
    rateLimitPerMin: 100,
    features: ["5,000 credits/month", "10 API keys", "100 requests/min", "Priority support", "Usage analytics"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceCents: 4900,
    monthlyCredits: 15000,
    maxApiKeys: 999,
    rateLimitPerMin: 9999,
    features: ["15,000 credits/month", "Unlimited API keys", "No rate limit", "Dedicated support", "SLA guarantee", "Custom models"],
  },
];

export const SERVICE_COSTS = [
  { service: "Image Generation", credits: 5, perCredit: "$0.005" },
  { service: "Text to Speech", credits: 2, perCredit: "$0.005" },
  { service: "Transcription", credits: 3, perCredit: "$0.005" },
];

export function getPlan(id: string): Plan {
  return PLANS.find((p) => p.id === id) || PLANS[0];
}

export function formatPrice(cents: number): string {
  if (cents === 0) return "$0";
  return `$${(cents / 100).toFixed(0)}`;
}
