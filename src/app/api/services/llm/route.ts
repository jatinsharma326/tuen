import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/services/auth";
import { checkServiceLimit, logUsage, checkRateLimit, getUserPlan } from "@/lib/services/credits";
import { getPlan } from "@/lib/constants/plans";
import { SERVICES } from "@/lib/services/config";

const SERVICE = SERVICES.llm;
const MODEL_SCOPE_API_KEY = process.env.MODELSCOPE_API_KEY || "";

export const maxDuration = 120;

const DEFAULT_MODEL = "zai-org/GLM-5.1";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userPlan = await getUserPlan(user.id);
  const plan = getPlan(userPlan?.plan || "pro");
  const withinLimit = await checkRateLimit(user.id, plan.rateLimitPerMin);
  if (!withinLimit) {
    return NextResponse.json({ error: "Rate limit exceeded. Slow down or upgrade for higher limits." }, { status: 429 });
  }

  const limitCheck = await checkServiceLimit(user.id, SERVICE.limitKey);
  if (!limitCheck.ok) {
    return NextResponse.json({ error: limitCheck.error }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { messages, model } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    const llmModel = model || DEFAULT_MODEL;

    const stream = await fetchModelScopeStream(llmModel, messages);

    if (!stream.ok) {
      const errText = await stream.text().catch(() => "");
      return NextResponse.json({ error: `ModelScope error: ${stream.status} ${errText}` }, { status: 500 });
    }

    await logUsage(user.id, "llm");

    return new Response(stream.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Service error";
    return NextResponse.json({ error: `${msg}. No credits consumed.` }, { status: 500 });
  }
}

async function fetchModelScopeStream(model: string, messages: unknown[]) {
  return fetch(`${SERVICE.llmBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MODEL_SCOPE_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  });
}
