import { NextRequest, NextResponse } from "next/server";
import { solveVenn2Sets } from "@/lib/stem/sets";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nU = 60, nA = 35, nB = 28, nIntersection = 12 } = body;

    const data = solveVenn2Sets(
      Number(nU),
      Number(nA),
      Number(nB),
      Number(nIntersection)
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Venn API error:", error);
    return NextResponse.json({ error: "Failed to compute Venn data" }, { status: 500 });
  }
}
