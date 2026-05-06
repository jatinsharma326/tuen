import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/services/auth";
import { getCredits, deductCredits, logUsage, checkRateLimit, getUserPlan, refundCredits } from "@/lib/services/credits";
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
  const plan = getPlan(userPlan?.plan || "free");
  const withinLimit = await checkRateLimit(user.id, plan.rateLimitPerMin);
  if (!withinLimit) {
    return NextResponse.json({ error: "Rate limit exceeded. Upgrade your plan for higher limits." }, { status: 429 });
  }

  const credits = await getCredits(user.id);
  if (credits < SERVICE.creditsCost) {
    return NextResponse.json({ error: "Insufficient credits", credits, cost: SERVICE.creditsCost }, { status: 402 });
  }

  await deductCredits(user.id, SERVICE.creditsCost);

  try {
    const { prompt, aspect_ratio, style } = await req.json();
    if (!prompt?.trim()) {
      await refundCredits(user.id, SERVICE.creditsCost);
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const ratio = RATIO_MAP[aspect_ratio] || aspect_ratio || "1:1";
    const lora = style === "anime" ? "二次元画风 (XB_ZIMAGE_TURBO_ECY)" : "无";

    const result = await callGradio(SERVICE.gradioBaseUrl, SERVICE.gradioFnName, [
      prompt, ratio, lora, 0.8, 9, 0, -1, 1, false, 1024, 1024,
    ]);

    if (!result.fileUrl) {
      await refundCredits(user.id, SERVICE.creditsCost);
      return NextResponse.json({ error: "Generation failed. Credits refunded." }, { status: 500 });
    }

    await logUsage(user.id, "image_gen", SERVICE.creditsCost);
    return NextResponse.json({ image_url: result.fileUrl, success: true });
  } catch (e: unknown) {
    await refundCredits(user.id, SERVICE.creditsCost);
    const msg = e instanceof Error ? e.message : "Service error";
    return NextResponse.json({ error: `${msg}. Credits refunded.` }, { status: 500 });
  }
}
