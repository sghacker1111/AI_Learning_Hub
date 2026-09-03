import { NextRequest, NextResponse } from "next/server";
import { hybridRetrieveCDC } from "@/lib/rag/retriever";
import { RAGQueryRequest } from "@/lib/rag/types";

export async function POST(request: NextRequest) {
  try {
    const body: RAGQueryRequest = await request.json();
    const { query } = body;

    if (typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ error: "Query cannot be empty" }, { status: 400 });
    }
    if (query.length > 2000) {
      return NextResponse.json({ error: "Query must be at most 2000 characters." }, { status: 400 });
    }

    const result = await hybridRetrieveCDC(body);
    return NextResponse.json({ success: true, demo: true, persistedIndex: false, result });
  } catch (error) {
    console.error("RAG Query API error:", error);
    return NextResponse.json({ error: "Failed to retrieve curriculum context" }, { status: 500 });
  }
}
