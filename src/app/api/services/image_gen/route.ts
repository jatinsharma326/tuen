import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/services/auth";
import { checkServiceLimit, logUsage, checkRateLimit, getUserPlan } from "@/lib/services/credits";
import { getPlan } from "@/lib/constants/plans";
import { SERVICES } from "@/lib/services/config";
import { callGradio } from "@/lib/services/gradio";

const SERVICE = SERVICES.image_gen;

export const maxDuration = 120;

const RATIO_MAP: Record<string, string> = {
  square: "1:1",
  landscape: "16:9",
  portrait: "9:16",
  "4:3": "4:3",
  "3:4": "3:4",
};

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
    const { prompt, aspect_ratio, style } = await req.json();
    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const ratio = RATIO_MAP[aspect_ratio] || aspect_ratio || "1:1";
    const lora = style === "anime" ? "\u4E8C\u6B21\u5143\u753B\u98CE (XB_ZIMAGE_TURBO_ECY)" : "\u65E0";

    const result = await callGradio(SERVICE.gradioBaseUrl, SERVICE.gradioFnName, [
      prompt, ratio, lora, 0.8, 9, 0, -1, 1, false, 1024, 1024,
    ]);

    if (!result.fileUrl) {
      return NextResponse.json({ error: "Generation failed. No credits consumed." }, { status: 500 });
    }

    await logUsage(user.id, "image_gen");
    return NextResponse.json({ image_url: result.fileUrl, success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Service error";
    return NextResponse.json({ error: `${msg}. No credits consumed.` }, { status: 500 });
  }
}
