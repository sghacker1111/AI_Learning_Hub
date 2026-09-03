import { NextResponse } from "next/server";
import { SUBSCRIPTION_PLANS } from "@/lib/billing/plans";

export async function GET() {
  try {
    return NextResponse.json({ success: true, preview: true, paymentsConfigured: false, plans: SUBSCRIPTION_PLANS });
  } catch (error) {
    console.error("Billing plans API error:", error);
    return NextResponse.json({ error: "Failed to fetch subscription plans" }, { status: 500 });
  }
}
