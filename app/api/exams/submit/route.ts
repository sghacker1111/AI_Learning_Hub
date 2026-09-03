import { NextRequest, NextResponse } from "next/server";
import { generateExamPaper } from "@/lib/exams/generator";
import { evaluateExamSubmission } from "@/lib/exams/grading";
import { ExamSubmissionPayload } from "@/lib/exams/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submission, examKey = "ble_class_8_math" } = body as {
      submission: ExamSubmissionPayload;
      examKey: string;
    };

    if (!submission) {
      return NextResponse.json({ error: "submission payload is required" }, { status: 400 });
    }

    const paper = generateExamPaper(examKey);
    const reportCard = evaluateExamSubmission(paper, submission);

    return NextResponse.json({ success: true, demo: true, persisted: false, reportCard });
  } catch (error) {
    console.error("Exam submit API error:", error);
    const message = error instanceof Error ? error.message : "";
    const status = message.startsWith("Unknown exam key") ? 400 : 500;
    return NextResponse.json({ error: status === 400 ? message : "Failed to grade exam submission" }, { status });
  }
}
