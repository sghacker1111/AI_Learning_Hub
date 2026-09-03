import { NextResponse } from "next/server";
import { CDC_KNOWLEDGE_GRAPH_NODES, CDC_KNOWLEDGE_GRAPH_EDGES } from "@/lib/mastery/knowledge-graph";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      demo: true,
      persisted: false,
      nodes: CDC_KNOWLEDGE_GRAPH_NODES,
      edges: CDC_KNOWLEDGE_GRAPH_EDGES,
    });
  } catch (error) {
    console.error("Mastery graph API error:", error);
    return NextResponse.json({ error: "Failed to fetch knowledge graph" }, { status: 500 });
  }
}
