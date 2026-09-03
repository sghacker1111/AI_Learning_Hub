export type PaymentGatewayType = "ESEWA" | "KHALTI" | "FONEPAY" | "CONNECTIPS";

export type BillingCycle = "MONTHLY" | "ANNUAL";

export interface SubscriptionPlan {
  id: string;
  name: string;
  nameNepali: string;
  tagline: string;
  monthlyPriceNpr: number;
  annualPriceNpr: number;
  isPopular?: boolean;
  features: string[];
  featuresNepali: string[];
  maxChildren: number;
  unlimitedTutor: boolean;
  fullMockExams: boolean;
  offlinePacks: boolean;
  parentDigests: boolean;
}

export interface TaxBreakdown {
  baseAmountNpr: number;
  vatRatePercent: number; // 13
  vatAmountNpr: number;
  totalAmountNpr: number;
}

export interface CheckoutSession {
  sessionId: string;
  planId: string;
  planName: string;
  billingCycle: BillingCycle;
  gateway: PaymentGatewayType;
  taxBreakdown: TaxBreakdown;
  transactionUuid: string;
  gatewayPayload?: Record<string, unknown>;
  expiresAt: string;
}

export interface VATInvoice {
  invoiceNumber: string; // e.g. "INV-2081-0842"
  invoiceDateBs: string; // "2081-05-04"
  sellerPan: string; // "601234567"
  sellerName: string; // "AI Learning Hub Pvt. Ltd."
  buyerName: string;
  buyerPanOrPhone: string;
  planName: string;
  billingCycle: BillingCycle;
  paymentGateway: PaymentGatewayType;
  taxBreakdown: TaxBreakdown;
  transactionCode: string;
  paymentStatus: "PAID" | "PENDING" | "FAILED";
}

export interface StudentSubscriptionStatus {
  studentId: string;
  activePlan: SubscriptionPlan;
  billingCycle: BillingCycle;
  status: "ACTIVE" | "TRIAL" | "EXPIRED";
  expiresAt: string;
  recentInvoices: VATInvoice[];
}
