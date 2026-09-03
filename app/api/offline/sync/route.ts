import { NextRequest, NextResponse } from "next/server";
import { simulateReconcileOfflineOutbox } from "@/lib/offline/sync-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = simulateReconcileOfflineOutbox();

    return NextResponse.json({
      success: false,
      simulated: true,
      persisted: false,
      message: `Previewed reconciliation of ${result.syncedCount} demo activities; no XP was persisted.`,
      result,
      trigger: body.trigger || "manual",
    });
  } catch (error) {
    console.error("Offline sync API error:", error);
    return NextResponse.json({ error: "Failed to reconcile offline outbox" }, { status: 500 });
  }
}
