import { RoleCode } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await getSessionUser();
  if (!session || session.role !== RoleCode.SUPER_ADMIN) {
    return NextResponse.json({ error: "Super Admin access is required." }, { status: 403 });
  }

  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [summary, providerCounts, recentLogs] = await Promise.all([
      prisma.aIUsageLog.aggregate({
        where: { createdAt: { gte: startOfDay } },
        _count: { _all: true },
        _sum: { inputTokens: true, outputTokens: true },
        _avg: { latencyMs: true },
      }),
      prisma.aIUsageLog.groupBy({
        by: ["provider"],
        where: { createdAt: { gte: startOfDay } },
        _count: { _all: true },
      }),
      prisma.aIUsageLog.findMany({
        where: { createdAt: { gte: startOfDay } },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          provider: true,
          model: true,
          requestType: true,
          inputTokens: true,
          outputTokens: true,
          latencyMs: true,
          success: true,
          errorMessage: true,
          createdAt: true,
        },
      }),
    ]);

    const total = summary._count._all;
    const providerDistribution = Object.fromEntries(
      providerCounts.map((item) => [
        item.provider,
        total > 0 ? Math.round((item._count._all / total) * 100) : 0,
      ])
    );

    return NextResponse.json({
      metrics: {
        totalRequestsToday: total,
        totalTokensToday: (summary._sum.inputTokens || 0) + (summary._sum.outputTokens || 0),
        averageLatencyMs: Math.round(summary._avg.latencyMs || 0),
        fallbackCount: null,
        fallbackTrackingConfigured: false,
        providerDistribution,
        recentLogs: recentLogs.map((log) => ({ ...log, createdAt: log.createdAt.toISOString() })),
      },
      source: "AIUsageLog",
    });
  } catch (error) {
    console.error("AI Metrics API error:", error);
    return NextResponse.json({ error: "AI usage metrics are unavailable." }, { status: 503 });
  }
}
