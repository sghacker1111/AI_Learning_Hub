import type { AIProvider, CompletionOptions } from "./types";
import { cleanAIOutput } from "./clean-output";

export function providerEndpoint(provider: AIProvider, model?: string) {
  switch (provider) {
    case "groq": return { url: "https://api.groq.com/openai/v1", key: process.env.GROQ_API_KEY, model: model || "llama-3.3-70b-versatile" };
    case "openrouter": return { url: "https://openrouter.ai/api/v1", key: process.env.OPENROUTER_API_KEY, model: model || "qwen/qwen3.5-122b-a10b" };
    case "ollama": return { url: `${(process.env.OLLAMA_BASE_URL || "http://localhost:11434").replace(/\/$/, "")}/v1`, key: "ollama", model: model || process.env.OLLAMA_MODEL || "qwen3.5:4b" };
    default: return { url: process.env.AI_BASE_URL || "https://router.huggingface.co/v1", key: process.env.AI_API_KEY || process.env.HF_TOKEN || process.env.TOGETHER_API_KEY, model: model || process.env.AI_MODEL || "Qwen/Qwen3.5-122B-A10B:fastest" };
  }
}
/** Parses split UTF-8/SSE frames, including CRLF and a final unterminated line. */
export async function* sseData(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader(), decoder = new TextDecoder();
  let pending = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      pending += done ? decoder.decode() : decoder.decode(value, { stream: true });
      if (pending.length > 1_000_000) throw new Error("Provider frame exceeds the limit.");
      const lines = pending.split(/\r?\n/); pending = done ? "" : lines.pop() || "";
      for (const line of lines) if (line.startsWith("data:")) yield line.slice(5).trim();
      if (done) break;
    }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
export interface StreamUpdate { text: string; provider: AIProvider; model: string; done: boolean }
export async function* streamCompletion(options: CompletionOptions & { raw?: boolean }): AsyncGenerator<StreamUpdate> {
  const primary = options.providerOverride || (process.env.AI_PROVIDER as AIProvider) || "qwen";
  const fallback = (process.env.AI_FALLBACK_PROVIDER as AIProvider) || "qwen";
  const candidates = [{ provider: primary, model: options.modelOverride }, { provider: fallback, model: process.env.AI_FALLBACK_MODEL }];
  let exposed = false;
  for (const [index, candidate] of candidates.entries()) {
    const config = providerEndpoint(candidate.provider, candidate.model);
    try {
      options.signal?.throwIfAborted();
      if (!config.key) throw new Error("Provider key is not configured.");
      const response = await fetch(`${config.url.replace(/\/$/, "")}/chat/completions`, {
        method: "POST", headers: { Authorization: `Bearer ${config.key}`, "Content-Type": "application/json" },
        signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(65000)]) : AbortSignal.timeout(65000),
        body: JSON.stringify({ model: config.model, messages: options.messages, stream: true,
          temperature: options.temperature ?? 0.2, max_tokens: options.maxTokens ?? 1024,
          ...(candidate.provider === "qwen" ? { chat_template_kwargs: { enable_thinking: false } } : {}) }),
      });
      if (!response.ok || !response.body) throw new Error(`Provider unavailable (${response.status}).`);
      let raw = "", finished = false, lastVisible = "";
      for await (const data of sseData(response.body)) {
        options.signal?.throwIfAborted();
        if (data === "[DONE]") { finished = true; break; }
        const frame = JSON.parse(data);
        if (frame.error) throw new Error("Provider stream failed.");
        const choice = frame.choices?.[0];
        if (choice?.finish_reason === "length") throw new Error("The answer reached its length limit. Try a shorter question.");
        if (choice?.finish_reason === "stop") finished = true;
        if (typeof choice?.delta?.content === "string") raw += choice.delta.content;
        if (raw.length > 24000) throw new Error("The answer exceeds the lesson limit.");
        // Never expose reasoning fields, complete <think> blocks, or partial tag prefixes.
        const visible = options.raw ? raw : cleanAIOutput(raw.replace(/<(?:t(?:h(?:i(?:n(?:k)?)?)?)?)?$/i, ""));
        if (visible && visible !== lastVisible) { exposed = true; lastVisible = visible; yield { text: visible, provider: candidate.provider, model: config.model, done: false }; }
      }
      if (!finished || !lastVisible.trim()) throw new Error("The AI connection ended before the answer was complete.");
      yield { text: lastVisible, provider: candidate.provider, model: config.model, done: true };
      return;
    } catch (error) {
      if (options.signal?.aborted || exposed || index === candidates.length - 1) throw error;
      // Switching models after visible output would splice two different answers together.
      console.warn(JSON.stringify({ event: "ai_stream_fallback", provider: candidate.provider }));
    }
  }
}
