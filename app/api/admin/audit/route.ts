import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/observability/audit";
import { AuditActionType } from "@/lib/observability/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = (searchParams.get("action") as AuditActionType) || undefined;

    const logs = getAuditLogs(action);
    return NextResponse.json({ success: true, demo: true, complianceRecord: false, logs });
  } catch (error) {
    console.error("Admin audit API error:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
