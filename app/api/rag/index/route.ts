import { NextRequest, NextResponse } from "next/server";
import { chunkCurriculumText } from "@/lib/rag/chunker";
import { ChunkMetadata } from "@/lib/rag/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawText, metadata } = body as { rawText: string; metadata: ChunkMetadata };

    if (!rawText || !metadata) {
      return NextResponse.json({ error: "rawText and metadata are required." }, { status: 400 });
    }

    const newChunks = chunkCurriculumText(rawText, metadata);
    return NextResponse.json({
      success: true,
      persisted: false,
      message: `Validated and previewed ${newChunks.length} chunk(s). No persistent vector index is configured.`,
      chunksCreated: newChunks.length,
      chunks: newChunks,
    });
  } catch (error) {
    console.error("RAG Index API error:", error);
    return NextResponse.json({ error: "Failed to index curriculum content" }, { status: 500 });
  }
}
