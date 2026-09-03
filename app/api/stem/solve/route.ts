import { NextRequest, NextResponse } from "next/server";
import { solveVenn2Sets, generateVennStepsMarkdown } from "@/lib/stem/sets";
import { calculateNepalVAT } from "@/lib/stem/arithmetic";
import { factorizeQuadratic } from "@/lib/stem/algebra";
import { simulateUpthrust } from "@/lib/stem/physics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { problemType, params } = body;
    if (!params || typeof params !== "object") {
      return NextResponse.json({ error: "params must be an object." }, { status: 400 });
    }

    switch (problemType) {
      case "sets": {
        const { nU, nA, nB, nIntersection } = params;
        const result = solveVenn2Sets(nU, nA, nB, nIntersection);
        const markdown = generateVennStepsMarkdown(result);
        return NextResponse.json({ success: true, result, markdown });
      }
      case "vat": {
        const { markedPrice, discountPercentage, vatPercentage } = params;
        const result = calculateNepalVAT(markedPrice, discountPercentage, vatPercentage);
        return NextResponse.json({ success: true, result, markdown: result.stepsMarkdown });
      }
      case "factorization": {
        const { a, b, c } = params;
        const result = factorizeQuadratic(a, b, c);
        return NextResponse.json({ success: true, result });
      }
      case "physics": {
        const { volume, liquid, objectWeight, depth } = params;
        const result = simulateUpthrust(volume, liquid, objectWeight, depth);
        return NextResponse.json({ success: true, result });
      }
      default:
        return NextResponse.json({ error: "Unsupported problemType" }, { status: 400 });
    }
  } catch (error) {
    console.error("STEM solve API error:", error);
    const isInputError = error instanceof RangeError || error instanceof TypeError;
    return NextResponse.json(
      { error: isInputError && error instanceof Error ? error.message : "Failed to solve problem" },
      { status: isInputError ? 400 : 500 }
    );
  }
}
