import { NextRequest, NextResponse } from "next/server";
import { evaluateAnswerSubmission } from "@/lib/practice/adaptivity";
import { AnswerSubmissionPayload } from "@/lib/practice/types";
import { getSessionUser } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    const body = await request.json();
    const { payload, correctOptionId, explanation } = body as {
      payload: AnswerSubmissionPayload;
      correctOptionId: string;
      explanation: string;
    };

    if (!payload || !correctOptionId) {
      return NextResponse.json({ error: "payload and correctOptionId are required" }, { status: 400 });
    }

    const result = await evaluateAnswerSubmission(
      payload,
      correctOptionId,
      explanation || "Step-by-step explanation",
      session?.userId
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Practice submit API error:", error);
    return NextResponse.json({ error: "Failed to evaluate answer" }, { status: 500 });
  }
}
