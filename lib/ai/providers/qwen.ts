import { CompletionOptions, CompletionResult } from "../types";

export async function callQwen(
  options: CompletionOptions,
  config: { apiKey?: string; baseUrl?: string; model?: string } = {}
): Promise<CompletionResult> {
  const startTime = Date.now();
  const apiKey =
    config.apiKey ||
    process.env.AI_API_KEY ||
    process.env.HF_TOKEN ||
    process.env.TOGETHER_API_KEY ||
    "";
  const baseUrl = (
    config.baseUrl ||
    process.env.AI_BASE_URL ||
    "https://router.huggingface.co/v1"
  ).replace(/\/$/, "");
  const model =
    config.model ||
    process.env.AI_MODEL ||
    "Qwen/Qwen3.5-122B-A10B:fastest";

  if (!apiKey && process.env.NODE_ENV !== "production" && process.env.AI_ALLOW_SIMULATION === "true") {
    await new Promise((r) => setTimeout(r, 650));
    const lastUserMsg = options.messages.filter((m) => m.role === "user").pop()?.content || "Explain the concept";

    let simulatedText = `नमस्ते! Let's explore this step by step.

In Nepal CDC **Class 8 Mathematics (Sets)**, remember the fundamental cardinality relationship for overlapping sets:

$$n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$$

**Guiding Question for you:**
Before we calculate the total, what do you think $n(A \\cap B)$ represents in the Venn diagram? Are these elements counted once or twice?`;

    if (lastUserMsg.toLowerCase().includes("pressure") || lastUserMsg.toLowerCase().includes("force") || lastUserMsg.toLowerCase().includes("archimedes")) {
      simulatedText = `नमस्ते! Great question on **Science & Technology (Force & Pressure)**.

According to **Archimedes' Principle (आर्किमिडिजको सिद्धान्त)**:
When an object is immersed in a fluid, it experiences an upward buoyant force (Upthrust) equal to the weight of the displaced liquid:

$$U = V \\cdot d \\cdot g$$

Where:
- $V$ = Volume of displaced fluid ($m^3$)
- $d$ = Density of fluid ($kg/m^3$)
- $g$ = Acceleration due to gravity ($9.8 \\text{ m/s}^2$)

**Let's think together:** If an iron block is submerged in pure water ($d = 1000 \\text{ kg/m}^3$), why does its apparent weight feel lighter? What force is pushing upward?`;
    }

    return {
      text: simulatedText,
      provider: "qwen",
      model,
      inputTokens: 180,
      outputTokens: 195,
      latencyMs: Date.now() - startTime,
      usedFallback: false,
      isSimulated: true,
    };
  }

  if (!apiKey) {
    throw new Error("HF_TOKEN or AI_API_KEY is required for hosted Qwen inference.");
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
      top_p: 0.8,
      presence_penalty: 1.5,
      top_k: 20,
      max_tokens: options.maxTokens ?? 1024,
      chat_template_kwargs: {
        // Qwen 3.5 reasons by default. Tutor requests need a complete answer,
        // not a reasoning trace that consumes the response token budget.
        enable_thinking: false,
      },
    }),
    signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(60000)]) : AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Qwen Provider API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  const inputTokens = data.usage?.prompt_tokens || 150;
  const outputTokens = data.usage?.completion_tokens || 200;

  return {
    text,
    provider: "qwen",
    model,
    inputTokens,
    outputTokens,
    latencyMs: Date.now() - startTime,
    usedFallback: false,
    finishReason: data.choices?.[0]?.finish_reason,
  };
}
