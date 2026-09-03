import { CompletionOptions, CompletionResult } from "../types";

export async function callOllama(
  options: CompletionOptions,
  config: {
    baseUrl?: string;
    model?: string;
    allowSimulation?: boolean;
    signal?: AbortSignal;
    timeoutMs?: number;
    think?: boolean;
  } = {}
): Promise<CompletionResult> {
  const startTime = Date.now();
  const baseUrl = (config.baseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434").replace(/\/$/, "");
  const model = config.model || process.env.OLLAMA_MODEL || "qwen3:8b";
  const timeoutSignal = AbortSignal.timeout(config.timeoutMs ?? 120000);
  const requestSignal = options.signal || config.signal;
  const signal = requestSignal ? AbortSignal.any([requestSignal, timeoutSignal]) : timeoutSignal;
  const configuredContext = Number(process.env.OLLAMA_NUM_CTX || 4096);
  const numContext = Number.isFinite(configuredContext)
    ? Math.min(32768, Math.max(2048, Math.floor(configuredContext)))
    : 4096;

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: options.messages,
        stream: false,
        // Qwen3 returns its reasoning in a separate field. The adapter exposes
        // only message.content, so students receive the final answer without a
        // reasoning trace or presentation markers.
        think: config.think ?? process.env.OLLAMA_THINKING === "true",
        keep_alive: process.env.OLLAMA_KEEP_ALIVE || "10m",
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens ?? 1024,
          num_ctx: numContext,
        },
      }),
      // Local models often need extra time for the first load into memory.
      signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama returned status ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.message?.content || "",
      provider: "ollama",
      model,
      inputTokens: data.prompt_eval_count || 120,
      outputTokens: data.eval_count || 160,
      latencyMs: Date.now() - startTime,
      usedFallback: false,
    };
  } catch (error) {
    if (requestSignal?.aborted) throw error;
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.AI_ALLOW_SIMULATION === "true" &&
      config.allowSimulation !== false
    ) {
      // Development-only fallback keeps the route explainable if the daemon is stopped.
      return {
        text: `The local model ${model} is unavailable right now. Start Ollama, then ask the question again. For two overlapping sets, use n(A union B) = n(A) + n(B) - n(A intersection B).`,
        provider: "ollama",
        model,
        inputTokens: 110,
        outputTokens: 130,
        latencyMs: Date.now() - startTime,
        usedFallback: false,
        isSimulated: true,
      };
    }
    throw error;
  }
}
