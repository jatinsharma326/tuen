import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/services/auth";
import { getCredits, deductCredits, logUsage, checkRateLimit, getUserPlan, refundCredits } from "@/lib/services/credits";
import { getPlan } from "@/lib/constants/plans";
import { SERVICES } from "@/lib/services/config";

const SERVICE = SERVICES.transcribe;

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

  const credits = await getCredits(user.id);
  if (credits < SERVICE.creditsCost) {
    return NextResponse.json({ error: "Insufficient credits", credits, cost: SERVICE.creditsCost }, { status: 402 });
  }

  await deductCredits(user.id, SERVICE.creditsCost);

  try {
    const { audio_url, language } = await req.json();
    if (!audio_url?.trim()) {
      await refundCredits(user.id, SERVICE.creditsCost);
      return NextResponse.json({ error: "Audio URL is required" }, { status: 400 });
    }

    const lang = language || "en";
    const base = SERVICE.gradioBaseUrl;

    // Step 1: Submit
    const submitRes = await fetch(`${base}/gradio_api/call/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          { path: audio_url, meta: { _type: "gradio.FileData" } },
          lang,
        ],
      }),
    });

    if (!submitRes.ok) {
      await refundCredits(user.id, SERVICE.creditsCost);
      return NextResponse.json({ error: "Transcription submit failed. Credits refunded." }, { status: 500 });
    }

    const { event_id } = await submitRes.json();
    if (!event_id) {
      await refundCredits(user.id, SERVICE.creditsCost);
      return NextResponse.json({ error: "No event_id. Credits refunded." }, { status: 500 });
    }

    // Step 2: Poll — note the underscore prefix on _transcribe
    const pollRes = await fetch(`${base}/gradio_api/call/_transcribe/${event_id}`);

    if (!pollRes.ok || !pollRes.body) {
      await refundCredits(user.id, SERVICE.creditsCost);
      return NextResponse.json({ error: "Transcription poll failed. Credits refunded." }, { status: 500 });
    }

    // Step 3: Read SSE stream
    const reader = pollRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let transcription = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Look for complete event
      const idx = buffer.indexOf("event: complete\n");
      if (idx !== -1) {
        const after = buffer.slice(idx + "event: complete\n".length);
        const m = after.match(/^data: (.+)/m);
        if (m) {
          try {
            const parsed = JSON.parse(m[1]);
            if (Array.isArray(parsed) && parsed[0]) {
              transcription = String(parsed[0]);
            }
          } catch {}
          break;
        }
      }
    }

    reader.cancel().catch(() => {});

    // Fallback: parse from generating events
    if (!transcription) {
      const dataLines = buffer.match(/^data: \[.+$/gm);
      if (dataLines) {
        for (let i = dataLines.length - 1; i >= 0; i--) {
          try {
            const parsed = JSON.parse(dataLines[i].slice(6));
            if (Array.isArray(parsed) && typeof parsed[0] === "string" && parsed[0].length > 0) {
              transcription = parsed[0];
              break;
            }
          } catch {}
        }
      }
    }

    if (!transcription) {
      await refundCredits(user.id, SERVICE.creditsCost);
      return NextResponse.json({ error: "Could not extract transcription. Credits refunded." }, { status: 500 });
    }

    await logUsage(user.id, "transcribe", SERVICE.creditsCost);
    return NextResponse.json({ text: transcription, success: true });
  } catch (e: unknown) {
    await refundCredits(user.id, SERVICE.creditsCost);
    const msg = e instanceof Error ? e.message : "Service error";
    return NextResponse.json({ error: `${msg}. Credits refunded.` }, { status: 500 });
  }
}
