import { NextRequest, NextResponse } from "next/server";
import { simulateUpthrust, LIQUID_DENSITIES } from "@/lib/stem/physics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { volume = 0.002, liquid = "water", objectWeight = 30, depth = 0.5 } = body;

    const data = simulateUpthrust(
      parseFloat(String(volume)),
      liquid,
      parseFloat(String(objectWeight)),
      parseFloat(String(depth))
    );

    return NextResponse.json({
      success: true,
      data,
      availableLiquids: LIQUID_DENSITIES,
    });
  } catch (error) {
    console.error("Physics API error:", error);
    const message = error instanceof Error ? error.message : "Failed to simulate physics";
    return NextResponse.json({ error: message }, { status: error instanceof RangeError ? 400 : 500 });
  }
}
