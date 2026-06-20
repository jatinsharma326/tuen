export interface Plan {
  id: string;
  name: string;
  priceCents: number;
  dailyImageLimit: number;
  dailyTtsLimit: number;
  dailyTranscribeLimit: number;
  dailyLlmLimit: number;
  weeklyTotalLimit: number;
  monthlyTotalLimit: number;
  maxApiKeys: number;
  rateLimitPerMin: number;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "trial",
    name: "Trial",
    priceCents: 0,
    dailyImageLimit: 40,
    dailyTtsLimit: 30,
    dailyTranscribeLimit: 5,
    dailyLlmLimit: 5,
    weeklyTotalLimit: 100,
    monthlyTotalLimit: 500,
    maxApiKeys: 1,
    rateLimitPerMin: 5,
    features: [
      "40 images/day",
      "30 TTS requests/day",
      "5 transcriptions/day",
      "5 LLM chats/day",
      "100 requests/week total",
      "500 requests/month total",
      "1 API key",
      "5 requests/min",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceCents: 1900,
    dailyImageLimit: 200,
    dailyTtsLimit: 100,
    dailyTranscribeLimit: 200,
    dailyLlmLimit: 50,
    weeklyTotalLimit: 3000,
    monthlyTotalLimit: 10000,
    maxApiKeys: 10,
    rateLimitPerMin: 60,
    features: [
      "200 images/day",
      "100 TTS requests/day",
      "200 transcriptions/day",
      "50 LLM chats/day",
      "3,000 requests/week total",
      "10,000 requests/month total",
      "10 API keys",
      "60 requests/min",
      "Priority support",
      "Usage analytics",
    ],
  },
];

export const DEFAULT_PLAN = PLANS[0];

export function getPlan(id?: string): Plan {
  return PLANS.find((p) => p.id === id) || DEFAULT_PLAN;
}

export function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(0)}`;
}

export const SERVICE_LIMITS = {
  image: { daily: DEFAULT_PLAN.dailyImageLimit, label: "Image Generation" },
  tts: { daily: DEFAULT_PLAN.dailyTtsLimit, label: "Text to Speech" },
  transcribe: { daily: DEFAULT_PLAN.dailyTranscribeLimit, label: "Transcription" },
  llm: { daily: DEFAULT_PLAN.dailyLlmLimit, label: "LLM Chat" },
} as const;
