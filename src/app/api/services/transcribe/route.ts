import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/services/auth";
import { checkServiceLimit, logUsage, checkRateLimit, getUserPlan } from "@/lib/services/credits";
import { getPlan } from "@/lib/constants/plans";
import { SERVICES } from "@/lib/services/config";

const SERVICE = SERVICES.transcribe;

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

  const limitCheck = await checkServiceLimit(user.id, SERVICE.limitKey);
  if (!limitCheck.ok) {
    return NextResponse.json({ error: limitCheck.error }, { status: 429 });
  }

  try {
    const { audio_url, language } = await req.json();
    if (!audio_url?.trim()) {
      return NextResponse.json({ error: "Audio URL is required" }, { status: 400 });
    }

    const lang = language || "en";
    const base = SERVICE.gradioBaseUrl;

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
      return NextResponse.json({ error: "Transcription submit failed. No credits consumed." }, { status: 500 });
    }

    const { event_id } = await submitRes.json();
    if (!event_id) {
      return NextResponse.json({ error: "No event_id. No credits consumed." }, { status: 500 });
    }

    const pollRes = await fetch(`${base}/gradio_api/call/_transcribe/${event_id}`);

    if (!pollRes.ok || !pollRes.body) {
      return NextResponse.json({ error: "Transcription poll failed. No credits consumed." }, { status: 500 });
    }

    const reader = pollRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let transcription = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

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
      return NextResponse.json({ error: "Could not extract transcription. No credits consumed." }, { status: 500 });
    }

    await logUsage(user.id, "transcribe");
    return NextResponse.json({ text: transcription, success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Service error";
    return NextResponse.json({ error: `${msg}. No credits consumed.` }, { status: 500 });
  }
}
