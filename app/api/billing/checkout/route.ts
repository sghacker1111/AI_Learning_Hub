import { NextRequest, NextResponse } from "next/server";
import { SUBSCRIPTION_PLANS, calculateNepalVAT } from "@/lib/billing/plans";
import {
  generateEsewaPayload,
  generateKhaltiPayload,
  generateFonepayPayload,
  generateConnectIPSPayload,
} from "@/lib/billing/gateways";
import { PaymentGatewayType } from "@/lib/billing/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId = "plan-pro", billingCycle = "MONTHLY", gateway = "ESEWA" } = body;

    if (process.env.NODE_ENV === "production" && process.env.PAYMENTS_DEMO_MODE !== "true") {
      return NextResponse.json(
        { error: "Payment processing is not configured." },
        { status: 503 }
      );
    }

    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    if (!plan || plan.monthlyPriceNpr <= 0) {
      return NextResponse.json({ error: "Invalid paid subscription plan." }, { status: 400 });
    }
    if (billingCycle !== "MONTHLY" && billingCycle !== "ANNUAL") {
      return NextResponse.json({ error: "Invalid billing cycle." }, { status: 400 });
    }
    if (!["ESEWA", "KHALTI", "FONEPAY", "CONNECTIPS"].includes(gateway)) {
      return NextResponse.json({ error: "Invalid payment gateway." }, { status: 400 });
    }
    const totalAmount = billingCycle === "MONTHLY" ? plan.monthlyPriceNpr : plan.annualPriceNpr;
    const tax = calculateNepalVAT(totalAmount);
    const transactionUuid = `TXN-${Date.now()}`;

    let gatewayPayload;
    switch (gateway as PaymentGatewayType) {
      case "ESEWA":
        gatewayPayload = generateEsewaPayload(transactionUuid, tax);
        break;
      case "KHALTI":
        gatewayPayload = generateKhaltiPayload(transactionUuid, tax, plan.name);
        break;
      case "FONEPAY":
        gatewayPayload = generateFonepayPayload(transactionUuid, tax);
        break;
      case "CONNECTIPS":
        gatewayPayload = generateConnectIPSPayload(transactionUuid, tax);
        break;
    }

    return NextResponse.json({
      success: true,
      demo: true,
      message: "Sandbox checkout preview only. No payment has been charged.",
      sessionId: `sess-${Date.now()}`,
      plan,
      billingCycle,
      gateway,
      taxBreakdown: tax,
      transactionUuid,
      gatewayPayload,
    });
  } catch (error) {
    console.error("Billing checkout API error:", error);
    return NextResponse.json({ error: "Failed to initiate checkout session" }, { status: 500 });
  }
}
