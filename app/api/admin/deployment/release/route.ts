import { NextResponse } from "next/server";
import { getProductionReleaseMetadata, MASTER_26_PHASES_AUDIT } from "@/lib/deployment/release";

export async function GET() {
  try {
    const release = getProductionReleaseMetadata();
    return NextResponse.json({
      success: true,
      simulated: true,
      productionActive: false,
      release,
      auditMatrix: MASTER_26_PHASES_AUDIT,
    });
  } catch (error) {
    console.error("Release API error:", error);
    return NextResponse.json({ error: "Failed to fetch release metadata" }, { status: 500 });
  }
}
