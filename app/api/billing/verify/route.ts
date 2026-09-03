import { NextRequest, NextResponse } from "next/server";
import { PaymentGatewayType } from "@/lib/billing/types";

export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production" && process.env.PAYMENTS_DEMO_MODE !== "true") {
      return NextResponse.json(
        { error: "Payment verification is not configured." },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const gateway = (searchParams.get("gateway") || "esewa").toUpperCase() as PaymentGatewayType;
    const status = searchParams.get("status") || "success";

    if (!["ESEWA", "KHALTI", "FONEPAY", "CONNECTIPS"].includes(gateway)) {
      return NextResponse.json({ error: "Invalid payment gateway." }, { status: 400 });
    }

    if (status === "failure") {
      return NextResponse.json({ success: false, message: "Payment was cancelled or failed." }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      demo: true,
      verified: false,
      message: `${gateway} sandbox callback received. No real transaction was verified and no subscription was activated.`,
    });
  } catch (error) {
    console.error("Billing verify API error:", error);
    return NextResponse.json({ error: "Failed to verify transaction" }, { status: 500 });
  }
}
