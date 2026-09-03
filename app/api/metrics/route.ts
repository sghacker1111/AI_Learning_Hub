import { NextResponse } from "next/server";
import { getSystemPrometheusMetrics, formatPrometheusMetricsText } from "@/lib/observability/metrics";

export async function GET() {
  try {
    const metrics = getSystemPrometheusMetrics();
    const textOutput = formatPrometheusMetricsText(metrics);

    return new NextResponse(textOutput, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Prometheus metrics export error:", error);
    return new NextResponse("# Error collecting metrics", { status: 500 });
  }
}
