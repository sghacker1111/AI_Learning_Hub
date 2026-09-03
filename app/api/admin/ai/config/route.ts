import { RoleCode } from "@prisma/client";
import { NextResponse } from "next/server";
import { getImageProviderConfiguration } from "@/lib/ai/image/router";
import { AIProvider } from "@/lib/ai/types";
import { getSessionUser } from "@/lib/auth/session";

function getProviderModel(provider: AIProvider): string {
  switch (provider) {
    case "ollama":
      return process.env.OLLAMA_MODEL || "qwen3:8b";
    case "groq":
      return process.env.GROQ_MODEL || process.env.AI_FALLBACK_MODEL || "llama-3.3-70b-versatile";
    case "openrouter":
      return process.env.OPENROUTER_MODEL || "qwen/qwen-2.5-72b-instruct";
    case "qwen":
    default:
      return process.env.AI_MODEL || "Qwen/Qwen3.5-122B-A10B:fastest";
  }
}

function getConfiguredDefaults() {
  const primaryProvider = (process.env.AI_PROVIDER || "qwen") as AIProvider;
  const fallbackProvider = (process.env.AI_FALLBACK_PROVIDER || "groq") as AIProvider;
  return {
    primaryProvider,
    primaryModel: getProviderModel(primaryProvider),
    fallbackProvider,
    fallbackModel: process.env.AI_FALLBACK_MODEL || getProviderModel(fallbackProvider),
    temperature: 0.2,
    maxTokens: 1024,
    responseMode: "DIRECT_ANSWER_WITH_VERIFICATION",
    image: getImageProviderConfiguration(),
  };
}

export async function GET() {
  const session = await getSessionUser();
  if (!session || session.role !== RoleCode.SUPER_ADMIN) {
    return NextResponse.json({ error: "Super Admin access is required." }, { status: 403 });
  }
  return NextResponse.json({ config: getConfiguredDefaults(), source: "environment", persisted: true });
}

export async function POST() {
  const session = await getSessionUser();
  if (!session || session.role !== RoleCode.SUPER_ADMIN) {
    return NextResponse.json({ error: "Super Admin access is required." }, { status: 403 });
  }
  return NextResponse.json({
    success: false,
    persisted: false,
    error: "AI settings are environment-backed. Update the server environment and restart the app.",
  }, { status: 405, headers: { Allow: "GET" } });
}
