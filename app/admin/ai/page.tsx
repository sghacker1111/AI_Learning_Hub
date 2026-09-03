"use client";

import * as React from "react";
import Link from "next/link";
import {
  Cpu,
  ArrowLeft,
  Activity,
  Zap,
  CheckCircle2,
  Play,
  RotateCcw,
  Sliders,
  Server,
  ImageIcon,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AIProvider, ProviderHealthStatus } from "@/lib/ai/types";
import type { ImageProviderConfiguration } from "@/lib/ai/image/types";

interface ProviderItem {
  id: AIProvider;
  name: string;
  badge: string;
  defaultModel: string;
  description: string;
  iconColor: string;
  endpoint: string;
}

interface AdminAIMetrics {
  totalRequestsToday: number;
  totalTokensToday: number;
  averageLatencyMs: number;
  fallbackCount: number | null;
  fallbackTrackingConfigured: boolean;
}

const PROVIDERS: ProviderItem[] = [
  {
    id: "qwen",
    name: "Hugging Face Hosted Qwen",
    badge: "Configured Primary",
    defaultModel: "Qwen/Qwen3.5-122B-A10B:fastest",
    description: "Current open-weight Qwen 3.5 served through Hugging Face Inference Providers; reasoning is disabled for complete Tutor answers.",
    iconColor: "text-blue-600 bg-blue-500/10 border-blue-200 dark:border-blue-900/40",
    endpoint: "https://router.huggingface.co/v1",
  },
  {
    id: "groq",
    name: "Groq LPU Engine",
    badge: "Hosted Provider",
    defaultModel: "llama-3.3-70b-versatile",
    description: "Hosted inference option. Actual availability and latency are shown only after an explicit live probe.",
    iconColor: "text-amber-600 bg-amber-500/10 border-amber-200 dark:border-amber-900/40",
    endpoint: "https://api.groq.com/openai/v1",
  },
  {
    id: "openrouter",
    name: "OpenRouter Unified",
    badge: "Multi-Model Router",
    defaultModel: "qwen/qwen-2.5-72b-instruct",
    description: "External model-routing service; model access and reliability depend on the configured account and route.",
    iconColor: "text-purple-600 bg-purple-500/10 border-purple-200 dark:border-purple-900/40",
    endpoint: "https://openrouter.ai/api/v1",
  },
  {
    id: "ollama",
    name: "Local Ollama (Offline)",
    badge: "Optional Local Runtime",
    defaultModel: "qwen3:8b",
    description: "Optional offline adapter retained for administrators, but it is not used by the configured Tutor or image pipeline.",
    iconColor: "text-emerald-600 bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/40",
    endpoint: "http://localhost:11434",
  },
];

export default function AdminAIPage() {
  const [primaryProvider, setPrimaryProvider] = React.useState<AIProvider>("qwen");
  const [fallbackProvider, setFallbackProvider] = React.useState<AIProvider>("qwen");
  const [temperature, setTemperature] = React.useState("0.2");
  const [maxTokens, setMaxTokens] = React.useState("1024");
  const [saveBanner, setSaveBanner] = React.useState<string | null>(null);
  const [imageConfig, setImageConfig] = React.useState<ImageProviderConfiguration>({
    provider: "huggingface",
    model: null,
    inferenceProvider: "auto",
    configured: false,
    tokenConfigured: false,
    endpointConfigured: false,
    promptEnhancementEnabled: true,
    promptModel: "Qwen/Qwen3.5-122B-A10B:fastest",
    description: "Image configuration has not been loaded.",
  });
  const [metrics, setMetrics] = React.useState<AdminAIMetrics | null>(null);

  // Test bench state
  const [testResults, setTestResults] = React.useState<Record<string, ProviderHealthStatus>>({
    qwen: {
      provider: "qwen",
      name: "QWEN",
      status: "UNCONFIGURED",
      latencyMs: 0,
      model: "Qwen/Qwen3.5-122B-A10B:fastest",
      lastChecked: "Not checked",
      description: "Select Test Provider to run a live probe.",
    },
    groq: {
      provider: "groq",
      name: "GROQ",
      status: "UNCONFIGURED",
      latencyMs: 0,
      model: "llama-3.3-70b-versatile",
      lastChecked: "Not checked",
      description: "Select Test Provider to run a live probe.",
    },
    openrouter: {
      provider: "openrouter",
      name: "OPENROUTER",
      status: "UNCONFIGURED",
      latencyMs: 0,
      model: "qwen/qwen-2.5-72b-instruct",
      lastChecked: "Not checked",
      description: "Select Test Provider to run a live probe.",
    },
    ollama: {
      provider: "ollama",
      name: "OLLAMA",
      status: "UNCONFIGURED",
      latencyMs: 0,
      model: "qwen3:8b",
      lastChecked: "Not checked",
      description: "Select Test Provider to run a live probe.",
    },
  });

  const [testingProvider, setTestingProvider] = React.useState<string | null>(null);

  const loadMetrics = React.useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/admin/ai/metrics", { cache: "no-store", signal });
      const data = await response.json();
      setMetrics(response.ok && data.metrics ? data.metrics : null);
    } catch {
      if (!signal?.aborted) setMetrics(null);
    }
  }, []);

  const handleTestProvider = React.useCallback(async (providerId: AIProvider) => {
    setTestingProvider(providerId);
    try {
      const res = await fetch("/api/admin/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: providerId }),
      });
      const data = await res.json();
      if (data.result) {
        setTestResults((prev) => ({ ...prev, [providerId]: data.result }));
      }
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [providerId]: {
          ...prev[providerId],
          status: "OFFLINE",
          latencyMs: 0,
          lastChecked: new Date().toISOString(),
          description: "Provider probe request failed.",
        },
      }));
    } finally {
      setTestingProvider(null);
    }
  }, []);

  const loadActiveConfig = React.useCallback(async (showBanner: boolean) => {
    try {
      const response = await fetch("/api/admin/ai/config", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.config) {
        throw new Error(data.error || "Active configuration could not be loaded.");
      }
      setPrimaryProvider(data.config.primaryProvider);
      setFallbackProvider(data.config.fallbackProvider);
      setTemperature(String(data.config.temperature));
      setMaxTokens(String(data.config.maxTokens));
      if (data.config.image) setImageConfig(data.config.image);
      if (showBanner) setSaveBanner("Active server configuration reloaded.");
      await Promise.all([handleTestProvider(data.config.primaryProvider), loadMetrics()]);
    } catch {
      setSaveBanner("Active AI configuration could not be loaded or tested.");
    }
  }, [handleTestProvider, loadMetrics]);

  React.useEffect(() => {
    const controller = new AbortController();

    fetch("/api/admin/ai/config", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.config) return;
        setPrimaryProvider(data.config.primaryProvider);
        setFallbackProvider(data.config.fallbackProvider);
        setTemperature(String(data.config.temperature));
        setMaxTokens(String(data.config.maxTokens));
        if (data.config.image) setImageConfig(data.config.image);
        await handleTestProvider(data.config.primaryProvider);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setSaveBanner("Active AI configuration could not be loaded or tested.");
        }
      });

    fetch("/api/admin/ai/metrics", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        setMetrics(response.ok && data.metrics ? data.metrics : null);
      })
      .catch(() => {
        if (!controller.signal.aborted) setMetrics(null);
      });

    return () => controller.abort();
  }, [handleTestProvider, loadMetrics]);

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Center
                </Link>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">AI Provider Control Center & Fallback Engine</h1>
              <p className="text-xs text-muted-foreground">
                View the active environment-backed provider and run real inference probes without exposing credentials.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="nepal" size="sm" onClick={() => void loadActiveConfig(true)} className="gap-1.5 text-xs">
                <RotateCcw className="h-3.5 w-3.5" />
                Reload Active Config
              </Button>
            </div>
          </div>

          {/* Toast */}
          {saveBanner && (
            <div className="rounded-xl bg-amber-500/15 border border-amber-500/30 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-600" />
              <span>{saveBanner}</span>
            </div>
          )}

          {/* Telemetry Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border bg-card space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>Total AI Requests Today</span>
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-xl font-bold">{metrics ? metrics.totalRequestsToday.toLocaleString() : "Unavailable"}</div>
              <p className="text-[11px] text-muted-foreground">Database-backed successful and failed requests</p>
            </Card>

            <Card className="p-4 border bg-card space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>Average Inference Latency</span>
                <Zap className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-xl font-bold">{metrics ? `${metrics.averageLatencyMs.toLocaleString()} ms` : "Unavailable"}</div>
              <p className="text-[11px] text-muted-foreground">Average logged inference latency today</p>
            </Card>

            <Card className="p-4 border bg-card space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>Tokens Generated</span>
                <Cpu className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-xl font-bold">{metrics ? metrics.totalTokensToday.toLocaleString() : "Unavailable"}</div>
              <p className="text-[11px] text-muted-foreground">Logged input and output tokens today</p>
            </Card>

            <Card className="p-4 border bg-card space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>Fallback Failovers</span>
                <RotateCcw className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-xl font-bold">{metrics?.fallbackTrackingConfigured ? metrics.fallbackCount?.toLocaleString() : "Not tracked"}</div>
              <p className="text-[11px] text-muted-foreground">Fallback attribution is not stored yet</p>
            </Card>
          </div>

          {/* Active Routing Selector */}
          <Card className="border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm border-b pb-3">
              <Sliders className="h-4 w-4 text-primary" />
              <span>Active Routing & Fallback Chain</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Primary Provider (First Choice)</label>
                <select
                  value={primaryProvider}
                  disabled
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-primary"
                >
                  <option value="qwen">Hugging Face Hosted Qwen 3.5</option>
                  <option value="groq">Groq</option>
                  <option value="openrouter">OpenRouter (Multi-model)</option>
                  <option value="ollama">Local Ollama</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Fallback Provider (Failover)</label>
                <select
                  value={fallbackProvider}
                  disabled
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-primary"
                >
                  <option value="groq">Groq</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="qwen">Hosted Qwen fallback</option>
                  <option value="ollama">Local Ollama (Offline)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Answer Temperature ({temperature})</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="1.0"
                  value={temperature}
                  readOnly
                  className="text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Max Tokens Per Step</label>
                <Input
                  type="number"
                  step="128"
                  value={maxTokens}
                  readOnly
                  className="text-xs h-10"
                />
              </div>
            </div>
          </Card>

          <Card className="border bg-card p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-pink-200 bg-pink-500/10 text-pink-600 dark:border-pink-900/40">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-sm font-bold">Educational Image Generation</h2>
                  <p className="text-xs text-muted-foreground">Hosted Qwen prompt planning with Qwen-Image generation through Hugging Face Inference Providers.</p>
                </div>
              </div>
              <Badge variant={imageConfig.configured ? "success" : "outline"} className="text-[10px]">
                {imageConfig.configured ? "CONFIGURED" : "TOKEN REQUIRED"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-xl border bg-muted/20 p-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground">Image provider</div>
                <div className="font-mono font-semibold">{imageConfig.provider}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground">Model</div>
                <div className="break-all font-mono font-semibold">{imageConfig.model || "Not selected"}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground">Inference route</div>
                <div className="font-mono font-semibold">{imageConfig.endpointConfigured ? "Private endpoint" : imageConfig.inferenceProvider}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground">Prompt planner</div>
                <div className="break-all font-mono font-semibold">
                  {imageConfig.promptEnhancementEnabled ? imageConfig.promptModel : "Disabled"}
                </div>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{imageConfig.description}</p>
            <p className="text-[11px] text-muted-foreground">
              Generate an image from a Tutor response to run a real quota-consuming probe. Use Create Image for illustrations and Show Visual for exact labels or diagram geometry; Show Visual remains free without a token.
            </p>
          </Card>

          {/* Supported Providers Benchmark & Ping Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Configured AI Providers & Latency Test Bench</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {PROVIDERS.map((p) => {
                const health = testResults[p.id] || {
                  status: "UNCONFIGURED",
                  latencyMs: 0,
                  model: p.defaultModel,
                  description: "Not checked",
                };
                const isTesting = testingProvider === p.id;
                const isPrimary = primaryProvider === p.id;
                const isFallback = fallbackProvider === p.id;

                return (
                  <Card key={p.id} className="border bg-card p-5 space-y-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${p.iconColor}`}>
                          <Server className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-foreground">{p.name}</h3>
                            {isPrimary && (
                              <Badge variant="nepal" className="text-[10px]">
                                Selected Primary
                              </Badge>
                            )}
                            {isFallback && (
                              <Badge variant="subtle" className="text-[10px]">
                                Selected Fallback
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground font-mono">{p.endpoint}</p>
                        </div>
                      </div>

                      <Badge
                        variant={
                          health.status === "ONLINE"
                            ? "success"
                            : health.status === "DEGRADED" || health.status === "UNCONFIGURED"
                            ? "outline"
                            : "destructive"
                        }
                        className="text-[10px]"
                      >
                        {health.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">{p.description}</p>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 text-xs border">
                      <div>
                        <div className="text-[10px] text-muted-foreground font-semibold">Active Model</div>
                        <div className="font-mono text-primary font-semibold text-[11px]">
                          {health.model || p.defaultModel}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground font-semibold">Ping Latency</div>
                        <div className="font-bold text-foreground">{health.latencyMs} ms</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-muted-foreground">
                        Status: <strong>{health.description}</strong>
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isTesting}
                        onClick={() => handleTestProvider(p.id)}
                        className="h-8 text-xs gap-1.5"
                      >
                        <Play className="h-3 w-3" />
                        {isTesting ? "Testing Ping..." : "Test Ping"}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
