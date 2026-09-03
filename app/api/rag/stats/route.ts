import { NextResponse } from "next/server";
import { CDC_CURRICULUM_KNOWLEDGE_BASE } from "@/lib/rag/knowledge-base";
import { RAGIndexStats } from "@/lib/rag/types";

export async function GET() {
  try {
    const grades = new Set(CDC_CURRICULUM_KNOWLEDGE_BASE.map((chunk) => chunk.metadata.gradeCode));
    const subjects = new Set(CDC_CURRICULUM_KNOWLEDGE_BASE.map((chunk) => chunk.metadata.subjectCode));
    const stats: RAGIndexStats = {
      totalChunks: CDC_CURRICULUM_KNOWLEDGE_BASE.length,
      indexedGrades: grades.size,
      indexedSubjects: subjects.size,
      vectorDimension: 64,
      hybridStatus: "DETERMINISTIC_DEMO_RETRIEVAL",
      averageRetrievalLatencyMs: null,
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("RAG Stats API error:", error);
    return NextResponse.json({ error: "Failed to fetch RAG stats" }, { status: 500 });
  }
}
