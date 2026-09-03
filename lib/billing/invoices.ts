import { VATInvoice, StudentSubscriptionStatus, PaymentGatewayType, BillingCycle } from "./types";
import { SUBSCRIPTION_PLANS, calculateNepalVAT } from "./plans";

export function generateDemoInvoice(
  planName: string = "Student Pro",
  billingCycle: BillingCycle = "MONTHLY",
  gateway: PaymentGatewayType = "ESEWA"
): VATInvoice {
  const price = billingCycle === "MONTHLY" ? 499 : 4499;
  const tax = calculateNepalVAT(price);

  return {
    invoiceNumber: `INV-2081-${Math.floor(1000 + Math.random() * 9000)}`,
    invoiceDateBs: "2081-05-04",
    sellerPan: "601234567",
    sellerName: "AI Learning Hub Pvt. Ltd.",
    buyerName: "Aarav Sharma",
    buyerPanOrPhone: "+977-9841234567",
    planName,
    billingCycle,
    paymentGateway: gateway,
    taxBreakdown: tax,
    transactionCode: `TXN-${gateway}-${Date.now().toString().slice(-6)}`,
    paymentStatus: "PENDING",
  };
}

export function getStudentSubscriptionStatus(studentId: string = "student-demo-1"): StudentSubscriptionStatus {
  const activePlan = SUBSCRIPTION_PLANS.find((p) => p.id === "plan-pro") || SUBSCRIPTION_PLANS[1];
  const invoice = generateDemoInvoice("Student Pro", "MONTHLY", "ESEWA");

  return {
    studentId,
    activePlan,
    billingCycle: "MONTHLY",
    status: "TRIAL",
    expiresAt: "2081-06-04",
    recentInvoices: [invoice],
  };
}
