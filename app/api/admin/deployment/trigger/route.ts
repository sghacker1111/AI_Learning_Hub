import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action = "DEPLOY" } = body as { action?: string };
    if (action !== "DEPLOY" && action !== "ROLLBACK") {
      return NextResponse.json({ error: "Unsupported deployment action." }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      simulated: true,
      action,
      error: "No deployment provider is configured; no infrastructure was changed.",
    }, { status: 501 });
  } catch (error) {
    console.error("Deployment trigger API error:", error);
    return NextResponse.json({ error: "Failed to trigger deployment action" }, { status: 500 });
  }
}
