export type AIProvider = "qwen" | "openrouter" | "groq" | "ollama";

export interface AIMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  baseUrl?: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface CompletionOptions {
  signal?: AbortSignal;
  messages: AIMessage[];
  grade?: string;
  subject?: string;
  chapter?: string;
  socraticMode?: boolean;
  language?: "en" | "ne" | "bilingual";
  temperature?: number;
  maxTokens?: number;
  userId?: string;
  providerOverride?: AIProvider;
  modelOverride?: string;
}

export interface CompletionResult {
  text: string;
  provider: AIProvider;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  usedFallback: boolean;
  isSimulated?: boolean;
  finishReason?: string;
}

export interface AIStreamChunk {
  text: string;
  isDone: boolean;
  provider?: AIProvider;
  latencyMs?: number;
}

export interface ProviderHealthStatus {
  provider: AIProvider;
  name: string;
  status: "ONLINE" | "DEGRADED" | "OFFLINE" | "UNCONFIGURED";
  latencyMs: number;
  model: string;
  lastChecked: string;
  description: string;
}

export interface AIUsageMetrics {
  totalRequestsToday: number;
  totalTokensToday: number;
  averageLatencyMs: number;
  fallbackCount: number;
  providerDistribution: Record<AIProvider, number>;
}
