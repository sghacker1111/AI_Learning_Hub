import { CDC_CURRICULUM_KNOWLEDGE_BASE } from "@/lib/rag/knowledge-base";
import { PrometheusMetric } from "./types";

export function getSystemPrometheusMetrics(): PrometheusMetric[] {
  const memory = process.memoryUsage();
  return [
    {
      name: "process_uptime_seconds",
      help: "Uptime of the current application process.",
      type: "gauge",
      values: [{ value: Math.floor(process.uptime()) }],
    },
    {
      name: "process_resident_memory_bytes",
      help: "Resident memory used by the current application process.",
      type: "gauge",
      values: [{ value: memory.rss }],
    },
    {
      name: "rag_demo_chunks_loaded",
      help: "Number of curriculum demonstration chunks bundled in this process.",
      type: "gauge",
      values: [{ labels: { index: "bundled_demo" }, value: CDC_CURRICULUM_KNOWLEDGE_BASE.length }],
    },
  ];
}

function escapeLabel(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/"/g, '\\"');
}

export function formatPrometheusMetricsText(metrics: PrometheusMetric[]): string {
  const lines: string[] = [];
  for (const metric of metrics) {
    lines.push(`# HELP ${metric.name} ${metric.help}`);
    lines.push(`# TYPE ${metric.name} ${metric.type}`);
    for (const item of metric.values) {
      const labels = item.labels
        ? `{${Object.entries(item.labels).map(([key, value]) => `${key}="${escapeLabel(value)}"`).join(",")}}`
        : "";
      lines.push(`${metric.name}${labels} ${item.value}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
