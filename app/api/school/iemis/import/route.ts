import { NextRequest, NextResponse } from "next/server";
import { validateIEMISCode } from "@/lib/school/iemis";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { iemisCode, recordsCount = 10 } = body;

    if (iemisCode) {
      const val = validateIEMISCode(iemisCode);
      if (!val.isValid) {
        return NextResponse.json({ error: val.errorMessage }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      validated: true,
      persisted: false,
      simulated: true,
      message: `Validated a demo request for ${recordsCount} records; no IEMIS file was imported.`,
      importedCount: 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("School IEMIS import API error:", error);
    return NextResponse.json({ error: "Failed to process IEMIS import" }, { status: 500 });
  }
}
