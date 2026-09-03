import { CompletionOptions, CompletionResult } from "../types";

export async function callGroq(
  options: CompletionOptions,
  config: { apiKey?: string; baseUrl?: string; model?: string } = {}
): Promise<CompletionResult> {
  const startTime = Date.now();
  const apiKey = config.apiKey || process.env.GROQ_API_KEY || "";
  const baseUrl = (config.baseUrl || "https://api.groq.com/openai/v1").replace(/\/$/, "");
  const model = config.model || "llama-3.3-70b-versatile";

  if (!apiKey && process.env.NODE_ENV !== "production" && process.env.AI_ALLOW_SIMULATION === "true") {
    await new Promise((r) => setTimeout(r, 310)); // Groq is famously fast
    return {
      text: `Hello! Through **Groq Ultra-Fast Inference (${model})**:\n\nIn **Nepal CDC Class 8 Mathematics**:\n$$n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$$\n\nLet's apply the values step by step. What are $n(A)$ and $n(B)$ in your question?`,
      provider: "groq",
      model,
      inputTokens: 130,
      outputTokens: 145,
      latencyMs: Date.now() - startTime,
      usedFallback: false,
      isSimulated: true,
    };
  }

  if (!apiKey) {
    throw new Error("Groq API key is not configured.");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
    }),
    signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(8000)]) : AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return {
    text: data.choices?.[0]?.message?.content || "",
    provider: "groq",
    model,
    inputTokens: data.usage?.prompt_tokens || 130,
    outputTokens: data.usage?.completion_tokens || 150,
    latencyMs: Date.now() - startTime,
    usedFallback: false,
  };
}
