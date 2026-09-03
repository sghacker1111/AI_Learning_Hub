import { AIProvider, CompletionOptions, CompletionResult, ProviderHealthStatus } from "./types";
import { buildCDCSocraticSystemPrompt } from "./prompts";
import { callQwen } from "./providers/qwen";
import { callOpenRouter } from "./providers/openrouter";
import { callGroq } from "./providers/groq";
import { callOllama } from "./providers/ollama";
import { prisma } from "@/lib/db/prisma";
import { cleanAIOutput } from "./clean-output";

export async function generateCompletion(options: CompletionOptions): Promise<CompletionResult> {
  const primaryProvider: AIProvider = (options.providerOverride || process.env.AI_PROVIDER || "qwen") as AIProvider;
  const fallbackProvider: AIProvider = (process.env.AI_FALLBACK_PROVIDER || "groq") as AIProvider;

  // Ensure CDC System Prompt is injected
  const messages = [...options.messages];
  const hasSystemPrompt = messages.some((m) => m.role === "system");
  if (!hasSystemPrompt) {
    const socraticPrompt = buildCDCSocraticSystemPrompt(options);
    messages.unshift({ role: "system", content: socraticPrompt });
  }

  const enrichedOptions: CompletionOptions = { ...options, messages };

  const executeProvider = async (p: AIProvider, useFallbackModel = false): Promise<CompletionResult> => {
    const config = {
      model:
        options.modelOverride ||
        (useFallbackModel ? process.env.AI_FALLBACK_MODEL : undefined),
    };
    switch (p) {
      case "qwen":
        return callQwen(enrichedOptions, config);
      case "openrouter":
        return callOpenRouter(enrichedOptions, config);
      case "groq":
        return callGroq(enrichedOptions, config);
      case "ollama":
        return callOllama(enrichedOptions, config);
      default:
        return callQwen(enrichedOptions);
    }
  };

  let result: CompletionResult;
  try {
    result = await executeProvider(primaryProvider);
  } catch (primaryError) {
    if (options.signal?.aborted) throw primaryError;
    console.warn(`[AI Router] Primary provider (${primaryProvider}) failed. Failing over to ${fallbackProvider}. Error:`, primaryError);
    try {
      result = await executeProvider(fallbackProvider, true);
      result.usedFallback = true;
    } catch (fallbackError) {
      if (options.signal?.aborted) throw fallbackError;
      console.error(`[AI Router] Fallback provider (${fallbackProvider}) also failed:`, fallbackError);
      throw new Error(`All AI providers failed to respond. Please try again later.`);
    }
  }

  result.text = cleanAIOutput(result.text);
  if (!result.text) {
    throw new Error("The AI provider returned an empty response.");
  }

  // Telemetry: Log to AIUsageLog in background
  try {
    await prisma.aIUsageLog.create({
      data: {
        userId: options.userId || null,
        provider: result.provider,
        model: result.model,
        requestType: "tutor",
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        latencyMs: result.latencyMs,
        success: true,
      },
    }).catch(() => {});
  } catch {
    // Non-blocking telemetry
  }

  return result;
}

export async function testProvider(provider: AIProvider): Promise<ProviderHealthStatus> {
  const startTime = Date.now();
  const configured =
    provider === "qwen"
      ? Boolean(process.env.AI_API_KEY || process.env.HF_TOKEN || process.env.TOGETHER_API_KEY)
      : provider === "groq"
        ? Boolean(process.env.GROQ_API_KEY)
        : provider === "openrouter"
          ? Boolean(process.env.OPENROUTER_API_KEY)
          : true;
  if (!configured) {
    return {
      provider,
      name: provider.toUpperCase(),
      status: "UNCONFIGURED",
      latencyMs: 0,
      model: "Unknown",
      lastChecked: new Date().toISOString(),
      description: "Provider credentials are not configured.",
    };
  }
  const testOptions: CompletionOptions = {
    messages: [
      { role: "system", content: "You are a test assistant. Answer with exactly: 'OK'" },
      { role: "user", content: "Ping" },
    ],
    maxTokens: 10,
    temperature: 0.1,
  };

  try {
    let result: CompletionResult;
    switch (provider) {
      case "qwen":
        result = await callQwen(testOptions);
        break;
      case "openrouter":
        result = await callOpenRouter(testOptions);
        break;
      case "groq":
        result = await callGroq(testOptions);
        break;
      case "ollama":
        result = await callOllama(testOptions, { allowSimulation: false, think: false });
        break;
      default:
        throw new Error("Unknown provider");
    }

    const latencyMs = result.latencyMs || (Date.now() - startTime);
    const degradedAfterMs = provider === "ollama" ? 75000 : 2000;

    return {
      provider,
      name: provider.toUpperCase(),
      status: latencyMs > degradedAfterMs ? "DEGRADED" : "ONLINE",
      latencyMs,
      model: result.model,
      lastChecked: new Date().toISOString(),
      description: `Configured and responding normally (${latencyMs}ms)`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      provider,
      name: provider.toUpperCase(),
      status: "OFFLINE",
      latencyMs: Date.now() - startTime,
      model: "Unknown",
      lastChecked: new Date().toISOString(),
      description: errorMsg,
    };
  }
}
