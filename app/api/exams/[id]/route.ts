import { NextRequest, NextResponse } from "next/server";
import { generateExamPaper } from "@/lib/exams/generator";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const paper = generateExamPaper(id);
    return NextResponse.json({ success: true, demo: true, officialPaper: false, paper });
  } catch (error) {
    console.error("Exam get API error:", error);
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }
}
