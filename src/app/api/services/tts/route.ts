import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/services/auth";
import { getCredits, deductCredits, logUsage, checkRateLimit, getUserPlan, refundCredits } from "@/lib/services/credits";
import { getPlan } from "@/lib/constants/plans";
import { SERVICES } from "@/lib/services/config";
import { callGradio } from "@/lib/services/gradio";

function getService(model?: string) {
  if (model === "voxcpm") return SERVICES.tts_voxcpm;
  return SERVICES.tts;
}

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userPlan = await getUserPlan(user.id);
  const plan = getPlan(userPlan?.plan || "free");
  const withinLimit = await checkRateLimit(user.id, plan.rateLimitPerMin);
  if (!withinLimit) {
    return NextResponse.json({ error: "Rate limit exceeded. Upgrade your plan for higher limits." }, { status: 429 });
  }

  const { text, voice, model } = await req.json();
  const service = getService(model);

  const credits = await getCredits(user.id);
  if (credits < service.creditsCost) {
    return NextResponse.json({ error: "Insufficient credits", credits, cost: service.creditsCost }, { status: 402 });
  }

  await deductCredits(user.id, service.creditsCost);

  try {
    if (!text?.trim()) {
      await refundCredits(user.id, service.creditsCost);
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    let result;
    if (model === "voxcpm") {
      const voiceDesc = voice || "English, middle-aged male, deep voice, calm and professional";
      result = await callGradio(service.gradioBaseUrl, service.gradioFnName, [
        text, voiceDesc, null, false, "", 2, false, false,
      ]);
    } else {
      const speaker = voice || "en-Carter_man";
      result = await callGradio(service.gradioBaseUrl, service.gradioFnName, [
        1, text, speaker, "en-Carter_man", "en-Frank_man", "en-Maya_woman", 1.0,
      ]);
    }

    if (!result.fileUrl) {
      await refundCredits(user.id, service.creditsCost);
      return NextResponse.json({ error: "Generation failed. Credits refunded." }, { status: 500 });
    }

    await logUsage(user.id, "tts", service.creditsCost);
    return NextResponse.json({ audio_url: result.fileUrl, success: true });
  } catch (e: unknown) {
    await refundCredits(user.id, service.creditsCost);
    const msg = e instanceof Error ? e.message : "Service error";
    return NextResponse.json({ error: `${msg}. Credits refunded.` }, { status: 500 });
  }
}
