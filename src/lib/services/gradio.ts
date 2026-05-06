export async function callGradio(
  baseUrl: string,
  fnName: string,
  payload: unknown[],
): Promise<{ data: unknown[]; fileUrl: string | null }> {
  const submitRes = await fetch(
    `${baseUrl}/gradio_api/call/${fnName}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: payload }),
    },
  );

  if (!submitRes.ok) {
    const errText = await submitRes.text().catch(() => "");
    throw new Error(`Submit failed: ${submitRes.status} ${errText}`);
  }

  const { event_id } = await submitRes.json();
  if (!event_id) throw new Error("No event_id returned");

  const pollRes = await fetch(
    `${baseUrl}/gradio_api/call/${fnName}/${event_id}`,
  );

  if (!pollRes.ok || !pollRes.body) {
    throw new Error(`Poll failed: ${pollRes.status}`);
  }

  const reader = pollRes.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completeData = "";
  let errorData = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const idx = buffer.indexOf("event: complete\n");
    if (idx !== -1) {
      const after = buffer.slice(idx + "event: complete\n".length);
      const m = after.match(/^data: (.+)/m);
      if (m) { completeData = m[1]; break; }
    }

    const errIdx = buffer.indexOf("event: error\n");
    if (errIdx !== -1) {
      const after = buffer.slice(errIdx + "event: error\n".length);
      const m = after.match(/^data: (.+)/m);
      if (m) { errorData = m[1]; }
    }
  }

  reader.cancel().catch(() => {});

  if (errorData && !completeData) {
    let errMsg = errorData === "null" ? "Gradio service error" : errorData;
    try { const parsed = JSON.parse(errorData); if (typeof parsed === "string") errMsg = parsed; } catch { /* use raw */ }
    throw new Error(errMsg);
  }

  if (!completeData || completeData === "null") {
    const dataLines = buffer.match(/^data: \[.+$/gm);
    if (dataLines && dataLines.length > 0) {
      completeData = dataLines[dataLines.length - 1].slice(6);
    }
  }

  if (!completeData || completeData === "null") throw new Error("No data in response");

  const parsed = JSON.parse(completeData);
  const fileUrl = extractFileUrl(parsed, baseUrl);
  return { data: parsed, fileUrl };
}

function extractFileUrl(data: unknown[], baseUrl: string): string | null {
  const found = findUrl(data, baseUrl, false);
  if (found) return found;
  const foundStream = findUrl(data, baseUrl, true);
  if (foundStream) return foundStream;

  const text = JSON.stringify(data);
  const regexFallback = extractUrlFromString(text);
  if (regexFallback) return regexFallback;

  if (typeof data === "string") {
    const fromStr = extractUrlFromString(data);
    if (fromStr) return fromStr;
  }

  return null;
}

function extractUrlFromString(text: string): string | null {
  const urlPatterns = [/https?:\/\/[^\s"',<>]*\.(webp|png|jpg|jpeg)/gi, /"url"\s*:\s*"(https?:\/\/[^"]*\.(webp|png|jpg|jpeg))"/gi, /"url"\s*:\s*"(https?:\/\/[^"]*)"/gi];
  for (const pattern of urlPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      const last = matches[matches.length - 1];
      const innerMatch = last.match(/https?:\/\/[^\s"',<>]+/i);
      if (innerMatch) return innerMatch[0];
    }
  }
  return null;
}

function findUrl(obj: unknown, baseUrl: string, allowStream: boolean): string | null {
  if (typeof obj === "string") {
    return extractUrlFromString(obj);
  }

  if (!obj || typeof obj !== "object") return null;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findUrl(item, baseUrl, allowStream);
      if (found) return found;
    }
    return null;
  }

  const rec = obj as Record<string, unknown>;

  if (typeof rec.url === "string") {
    const urlStr = rec.url;
    if (urlStr.startsWith("http")) {
      if (rec.is_stream === true && !allowStream) return null;
      if (!allowStream && (urlStr.includes("playlist") || urlStr.includes("/stream/"))) return null;
      return urlStr;
    }
    if (urlStr.startsWith("/")) {
      const constructed = `${baseUrl}${urlStr}`;
      return constructed;
    }
  }

  if (typeof rec.path === "string") {
    const constructed = rec.path.startsWith("http") ? rec.path : `${baseUrl}/gradio_api/file=${rec.path}`;
    return constructed;
  }

  if (rec.image) {
    if (typeof rec.image === "string") {
      const fromStr = extractUrlFromString(rec.image);
      if (fromStr) return fromStr;
    }
    if (typeof rec.image === "object") {
      const found = findUrl(rec.image, baseUrl, allowStream);
      if (found) return found;
    }
  }

  if (rec.value) {
    if (typeof rec.value === "string") {
      const fromStr = extractUrlFromString(rec.value);
      if (fromStr) return fromStr;
    }
    if (typeof rec.value === "object") {
      const found = findUrl(rec.value, baseUrl, allowStream);
      if (found) return found;
    }
  }

  for (const val of Object.values(rec)) {
    if (val && typeof val === "object") {
      const found = findUrl(val, baseUrl, allowStream);
      if (found) return found;
    }
  }

  return null;
}
