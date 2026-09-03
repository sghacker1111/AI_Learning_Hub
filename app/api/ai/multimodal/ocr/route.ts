import { NextRequest, NextResponse } from "next/server";
import { RoleCode } from "@prisma/client";
import { processImageOCR } from "@/lib/ai/multimodal/ocr";
import { getSessionUser } from "@/lib/auth/session";

const AI_ROLES = new Set<RoleCode>([RoleCode.STUDENT, RoleCode.TEACHER, RoleCode.SUPER_ADMIN]);

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !AI_ROLES.has(session.role)) {
      return NextResponse.json({ error: "Student, teacher, or Super Admin access is required." }, { status: 403 });
    }
    const body = await request.json();
    const { image, sampleKey } = body;

    if (image && !sampleKey) {
      return NextResponse.json({ error: "Live image OCR is not configured." }, { status: 501 });
    }

    const result = await processImageOCR(image || "", sampleKey);
    return NextResponse.json({ success: true, demo: true, imageAnalyzed: false, result });
  } catch (error) {
    console.error("OCR API error:", error);
    return NextResponse.json({ error: "Invalid scanner sample." }, { status: 400 });
  }
}
