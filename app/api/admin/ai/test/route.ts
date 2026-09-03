import { NextRequest, NextResponse } from "next/server";
import { RoleCode } from "@prisma/client";
import { testProvider } from "@/lib/ai/router";
import { AIProvider } from "@/lib/ai/types";
import { getSessionUser } from "@/lib/auth/session";

const SUPPORTED_PROVIDERS = new Set<AIProvider>(["qwen", "openrouter", "groq", "ollama"]);

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== RoleCode.SUPER_ADMIN) {
      return NextResponse.json({ error: "Super Admin access is required." }, { status: 403 });
    }

    const body = await request.json();
    const provider = (body.provider || "qwen") as AIProvider;
    if (!SUPPORTED_PROVIDERS.has(provider)) {
      return NextResponse.json({ error: "Unsupported AI provider." }, { status: 400 });
    }

    const healthStatus = await testProvider(provider);
    return NextResponse.json({ success: true, result: healthStatus });
  } catch (error: unknown) {
    console.error("Test Provider API error:", error);
    const msg = error instanceof Error ? error.message : "Provider test failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
