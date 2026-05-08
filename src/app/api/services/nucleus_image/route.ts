import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/services/auth";
import { checkServiceLimit, logUsage, checkRateLimit, getUserPlan } from "@/lib/services/credits";
import { getPlan } from "@/lib/constants/plans";
import { SERVICES } from "@/lib/services/config";
import { callGradio } from "@/lib/services/gradio";

const SERVICE = SERVICES.nucleus_image;

export const maxDuration = 120;

const RATIO_MAP: Record<string, string> = {
  "1:1": "1:1 (\u6B63\u65B9\u5F62)",
  square: "1:1 (\u6B63\u65B9\u5F62)",
  "16:9": "16:9 (\u5BBD\u5C4F)",
  landscape: "16:9 (\u5BBD\u5C4F)",
  "9:16": "9:16 (\u7AD6\u5C4F)",
  portrait: "9:16 (\u7AD6\u5C4F)",
  "4:3": "4:3 (\u6807\u51C6)",
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
    const { prompt, aspect_ratio } = await req.json();
    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const ratio = RATIO_MAP[aspect_ratio] || aspect_ratio || "1:1 (\u6B63\u65B9\u5F62)";

    const result = await callGradio(SERVICE.gradioBaseUrl, SERVICE.gradioFnName, [
      prompt, ratio, 42, false,
    ]);

    if (!result.fileUrl) {
      return NextResponse.json({ error: "Generation failed. No credits consumed." }, { status: 500 });
    }

    await logUsage(user.id, "nucleus_image");
    return NextResponse.json({ image_url: result.fileUrl, success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Service error";
    return NextResponse.json({ error: `${msg}. No credits consumed.` }, { status: 500 });
  }
}
