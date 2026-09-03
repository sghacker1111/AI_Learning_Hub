import { CompletionOptions, CompletionResult } from "../types";

export async function callOpenRouter(
  options: CompletionOptions,
  config: { apiKey?: string; baseUrl?: string; model?: string } = {}
): Promise<CompletionResult> {
  const startTime = Date.now();
  const apiKey = config.apiKey || process.env.OPENROUTER_API_KEY || "";
  const baseUrl = (config.baseUrl || "https://openrouter.ai/api/v1").replace(/\/$/, "");
  const model = config.model || "qwen/qwen-2.5-72b-instruct";

  if (!apiKey && process.env.NODE_ENV !== "production" && process.env.AI_ALLOW_SIMULATION === "true") {
    await new Promise((r) => setTimeout(r, 720));
    return {
      text: `Hello! Through **OpenRouter (${model})**, let's solve this CDC problem systematically.\n\n$$\\text{Formula: } n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$$\n\nWhat values are given in your problem statement?`,
      provider: "openrouter",
      model,
      inputTokens: 140,
      outputTokens: 160,
      latencyMs: Date.now() - startTime,
      usedFallback: false,
      isSimulated: true,
    };
  }

  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured.");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://ailearning.np",
      "X-Title": "AI Learning Nepal",
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
    }),
    signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return {
    text: data.choices?.[0]?.message?.content || "",
    provider: "openrouter",
    model,
    inputTokens: data.usage?.prompt_tokens || 140,
    outputTokens: data.usage?.completion_tokens || 180,
    latencyMs: Date.now() - startTime,
    usedFallback: false,
  };
}
