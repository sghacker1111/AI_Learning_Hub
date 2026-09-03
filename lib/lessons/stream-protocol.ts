export async function readLessonStream(response: Response, receive: (event: Record<string, unknown>) => void) {
  if (!response.body) throw new Error("Streaming is not available. Please retry.");
  const reader = response.body.getReader(), decoder = new TextDecoder();
  let buffer = "", completed = false;
  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      if (buffer.length > 150000) throw new Error("Lesson response is too large.");
      const lines = buffer.split("\n"); buffer = done ? "" : lines.pop() || "";
      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line) as Record<string, unknown>;
        if (event.type === "error") throw new Error(String(event.error || "Your AI connection was interrupted."));
        if (event.type === "done") completed = true;
        receive(event);
      }
      if (done) break;
    }
    if (!completed) throw new Error("Connection interrupted. Retry your last question.");
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
export function lessonStreamResponse(run: (send: (event: unknown) => void, signal: AbortSignal) => Promise<void>, requestSignal: AbortSignal) {
  const abort = new AbortController();
  const signal = AbortSignal.any([requestSignal, abort.signal]);
  const encoder = new TextEncoder();
  return new Response(new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: unknown) => { if (!signal.aborted) controller.enqueue(encoder.encode(JSON.stringify(event) + "\n")); };
      const heartbeat = setInterval(() => send({ type: "heartbeat" }), 10000);
      try { await run(send, signal); }
      catch (error) { if (!signal.aborted) send({ type: "error", error: error instanceof Error && /length limit|connection ended/.test(error.message) ? error.message : "Your teacher could not finish this turn. Please retry; no mastery was awarded." }); }
      finally { clearInterval(heartbeat); if (!abort.signal.aborted) controller.close(); }
    },
    cancel() { abort.abort(); },
  }), { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store, no-transform", "X-Accel-Buffering": "no" } });
}
