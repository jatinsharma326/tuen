import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/services/auth";
import { checkServiceLimit, logUsage, checkRateLimit, getUserPlan } from "@/lib/services/credits";
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
  const plan = getPlan(userPlan?.plan || "pro");
  const withinLimit = await checkRateLimit(user.id, plan.rateLimitPerMin);
  if (!withinLimit) {
    return NextResponse.json({ error: "Rate limit exceeded. Slow down or upgrade for higher limits." }, { status: 429 });
  }

  const { text, voice, model } = await req.json();
  const service = getService(model);

  const limitCheck = await checkServiceLimit(user.id, service.limitKey);
  if (!limitCheck.ok) {
    return NextResponse.json({ error: limitCheck.error }, { status: 429 });
  }

  try {
    if (!text?.trim()) {
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
      return NextResponse.json({ error: "Generation failed. No credits consumed." }, { status: 500 });
    }

    await logUsage(user.id, "tts");
    return NextResponse.json({ audio_url: result.fileUrl, success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message || "Unknown error" : "Service error";
    console.error("tts error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
