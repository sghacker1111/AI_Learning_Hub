import { NextResponse } from "next/server";
import { getStudentSubscriptionStatus } from "@/lib/billing/invoices";

export async function GET() {
  try {
    const status = getStudentSubscriptionStatus("student-demo-1");
    return NextResponse.json({ success: true, demo: true, validTaxInvoices: false, subscription: status });
  } catch (error) {
    console.error("Billing invoices API error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}
