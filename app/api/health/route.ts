import { NextResponse } from "next/server";
import { getSystemHealthReport } from "@/lib/observability/health";

export async function GET() {
  try {
    const health = await getSystemHealthReport();
    return NextResponse.json(health, {
      status: health.overallStatus === "UNHEALTHY" ? 503 : 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("System health check error:", error);
    return NextResponse.json(
      {
        overallStatus: "UNHEALTHY",
        error: "Health probe failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
