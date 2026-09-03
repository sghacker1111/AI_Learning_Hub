import prisma from "@/lib/db/prisma";
import { CDC_CURRICULUM_KNOWLEDGE_BASE } from "@/lib/rag/knowledge-base";
import { HealthStatus, SystemHealthReport, SubsystemHealth } from "./types";

async function probeDatabase(): Promise<SubsystemHealth> {
  const startedAt = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      id: "db-prisma",
      name: "Primary Database (Prisma ORM)",
      nameNepali: "मुख्य डाटाबेस प्रणाली",
      status: "HEALTHY",
      latencyMs: Math.round(performance.now() - startedAt),
      uptimePercent: 100,
      message: "The current database connectivity probe succeeded.",
    };
  } catch {
    return {
      id: "db-prisma",
      name: "Primary Database (Prisma ORM)",
      nameNepali: "मुख्य डाटाबेस प्रणाली",
      status: "UNHEALTHY",
      latencyMs: Math.round(performance.now() - startedAt),
      uptimePercent: 0,
      message: "The database connectivity probe failed.",
    };
  }
}

export async function getSystemHealthReport(): Promise<SystemHealthReport> {
  const database = await probeDatabase();
  const hasAiProvider = Boolean(
    process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY || process.env.OLLAMA_BASE_URL
  );
  const paymentDemo = process.env.PAYMENTS_DEMO_MODE === "true";

  const subsystems: SubsystemHealth[] = [
    database,
    {
      id: "ai-provider-config",
      name: "AI Provider Configuration",
      nameNepali: "एआई प्रदायक कन्फिगरेसन",
      status: hasAiProvider ? "HEALTHY" : "DEGRADED",
      latencyMs: 0,
      uptimePercent: 0,
      message: hasAiProvider
        ? "At least one provider is configured; this endpoint does not make a billable provider request."
        : "No external AI provider credentials were detected; deterministic fallbacks may be used.",
    },
    {
      id: "rag-demo-index",
      name: "Bundled Curriculum Retrieval Dataset",
      nameNepali: "पाठ्यक्रम खोज नमुना डाटासेट",
      status: "DEGRADED",
      latencyMs: 0,
      uptimePercent: 100,
      message: "A small in-process demonstration dataset is loaded; no persistent vector database is configured.",
      details: { chunks: CDC_CURRICULUM_KNOWLEDGE_BASE.length },
    },
    {
      id: "iemis-integration",
      name: "IEMIS Integration",
      nameNepali: "IEMIS एकीकरण",
      status: "DEGRADED",
      latencyMs: 0,
      uptimePercent: 0,
      message: "IEMIS import and synchronization are demonstrations and are not connected to a ministry service.",
    },
    {
      id: "payment-gateways",
      name: "Payment Gateway Integration",
      nameNepali: "भुक्तानी गेटवे एकीकरण",
      status: "DEGRADED",
      latencyMs: 0,
      uptimePercent: 0,
      message: paymentDemo
        ? "Payment sandbox previews are enabled; no live transaction verification is implemented."
        : "Payment processing is disabled until merchant signing and server verification are configured.",
    },
  ];

  const overallStatus: HealthStatus = database.status === "UNHEALTHY" ? "UNHEALTHY" : "DEGRADED";
  return {
    overallStatus,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    timestampBs: "Unavailable",
    version: process.env.npm_package_version ?? "0.1.0",
    subsystems,
  };
}
