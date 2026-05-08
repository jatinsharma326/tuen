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

export const DEFAULT_PLAN: Plan = {
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
};

export function getPlan(_id?: string): Plan {
  return DEFAULT_PLAN;
}

export function formatPrice(cents: number): string {
  if (cents === 0) return "$0";
  return `$${(cents / 100).toFixed(0)}`;
}

export const SERVICE_LIMITS = {
  image: { daily: 200, label: "Image Generation" },
  tts: { daily: 100, label: "Text to Speech" },
  transcribe: { daily: 200, label: "Transcription" },
  llm: { daily: 50, label: "LLM Chat" },
} as const;
