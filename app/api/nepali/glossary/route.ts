import { NextRequest, NextResponse } from "next/server";
import { searchGlossary } from "@/lib/nepali/glossary";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const subject = searchParams.get("subject") || "ALL";

    const terms = searchGlossary(query, subject);
    return NextResponse.json({
      success: true,
      total: terms.length,
      terms,
    });
  } catch (error) {
    console.error("Glossary API error:", error);
    return NextResponse.json({ error: "Failed to fetch glossary" }, { status: 500 });
  }
}
