"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  Download,
  ShieldCheck,
  Building,
} from "lucide-react";
import { StudentDashboardShell } from "@/components/layout/student-dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SUBSCRIPTION_PLANS, calculateNepalVAT } from "@/lib/billing/plans";
import { getStudentSubscriptionStatus } from "@/lib/billing/invoices";
import { PaymentGatewayType, BillingCycle, VATInvoice } from "@/lib/billing/types";

export default function StudentBillingPage() {
  const [subscription, setSubscription] = React.useState(() => getStudentSubscriptionStatus("student-demo-1"));
  const [selectedPlanId, setSelectedPlanId] = React.useState("plan-pro");
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>("MONTHLY");
  const [selectedGateway, setSelectedGateway] = React.useState<PaymentGatewayType>("ESEWA");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = React.useState<string | null>(null);

  const activePlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[1];
  const price = billingCycle === "MONTHLY" ? activePlan.monthlyPriceNpr : activePlan.annualPriceNpr;
  const tax = calculateNepalVAT(price);

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setPaymentSuccessMessage(`Connecting to ${selectedGateway} Sandbox Gateway...`);

    setTimeout(() => {
      setIsProcessing(false);
      const newInvoice: VATInvoice = {
        invoiceNumber: `INV-2081-${Math.floor(1000 + Math.random() * 9000)}`,
        invoiceDateBs: "2081-05-04",
        sellerPan: "601234567",
        sellerName: "AI Learning Hub Pvt. Ltd.",
        buyerName: "Aarav Sharma",
        buyerPanOrPhone: "+977-9841234567",
        planName: activePlan.name,
        billingCycle,
        paymentGateway: selectedGateway,
        taxBreakdown: tax,
        transactionCode: `TXN-${selectedGateway}-${Date.now().toString().slice(-6)}`,
        paymentStatus: "PENDING",
      };

      setSubscription((prev) => ({
        ...prev,
        activePlan,
        billingCycle,
        status: "TRIAL",
        recentInvoices: [newInvoice, ...prev.recentInvoices],
      }));

      setPaymentSuccessMessage(
        `${selectedGateway} sandbox preview completed. No payment was charged and no tax invoice was issued.`
      );
      setTimeout(() => setPaymentSuccessMessage(null), 6000);
    }, 1500);
  };

  return (
    <StudentDashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/student/dashboard"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
              </Link>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Subscription Billing & Payment Gateways</h1>
            <p className="text-xs text-muted-foreground">
              Preview subscription pricing and sandbox payment payloads. Real gateway verification is not configured.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="nepal" className="text-[10px]">
              Demo Plan: {subscription.activePlan.name}
            </Badge>
          </div>
        </div>

        {/* Success Banner */}
        {paymentSuccessMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{paymentSuccessMessage}</span>
          </div>
        )}

        {/* Top Active Subscription Telemetry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 border bg-card space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Current Subscription</span>
              <Badge variant="subtle" className="text-[10px]">DEMO TRIAL</Badge>
            </div>
            <div className="text-xl font-bold text-foreground">{subscription.activePlan.name}</div>
            <p className="text-xs text-muted-foreground">
              Renews on: <strong>{subscription.expiresAt} (वि.सं.)</strong>
            </p>
          </Card>

          <Card className="p-5 border bg-card space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Tax Invoicing Status</span>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-foreground">VAT Preview</div>
            <p className="text-xs text-muted-foreground">Illustrative calculation; not a tax invoice.</p>
          </Card>

          <Card className="p-5 border bg-card space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Payment Security</span>
              <Building className="h-4 w-4 text-primary" />
            </div>
            <div className="text-xl font-bold text-primary">Sandbox Connectors</div>
            <p className="text-xs text-muted-foreground">No merchant credentials or live settlement.</p>
          </Card>
        </div>

        {/* Checkout Wizard & Gateway Selector */}
        <Card className="p-6 border bg-card space-y-6 shadow-md">
          <div className="border-b pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-foreground">Upgrade / Renew Subscription</h3>
              <p className="text-xs text-muted-foreground">Select your plan, billing cycle, and preferred payment gateway.</p>
            </div>
            <Badge variant="subtle" className="text-[10px]">Demo Only</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Plan & Cycle Selection */}
            <div className="lg:col-span-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Select Plan</label>
                <div className="grid grid-cols-3 gap-2">
                  {SUBSCRIPTION_PLANS.filter((p) => p.monthlyPriceNpr > 0).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedPlanId === p.id
                          ? "border-primary bg-primary/10 font-bold"
                          : "bg-muted/20 border-border text-muted-foreground"
                      }`}
                    >
                      <div className="text-xs text-foreground font-bold">{p.name}</div>
                      <div className="text-[11px] text-primary pt-0.5 font-mono">NPR {p.monthlyPriceNpr}/mo</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Billing Cycle</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBillingCycle("MONTHLY")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      billingCycle === "MONTHLY" ? "border-primary bg-primary/10 text-foreground" : "bg-muted/20 text-muted-foreground"
                    }`}
                  >
                    Monthly (NPR {activePlan.monthlyPriceNpr})
                  </button>
                  <button
                    onClick={() => setBillingCycle("ANNUAL")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      billingCycle === "ANNUAL" ? "border-primary bg-primary/10 text-foreground" : "bg-muted/20 text-muted-foreground"
                    }`}
                  >
                    <span>Annual (NPR {activePlan.annualPriceNpr})</span>
                    <Badge variant="success" className="text-[9px] py-0">Save 25%</Badge>
                  </button>
                </div>
              </div>

              {/* Payment Gateway Radio Selection */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-foreground">Select Payment Method</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setSelectedGateway("ESEWA")}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      selectedGateway === "ESEWA" ? "border-emerald-500 bg-emerald-500/10 font-bold ring-2 ring-emerald-500" : "bg-muted/20 border-border"
                    }`}
                  >
                    <span className="text-lg">🟢</span>
                    <span className="text-xs text-foreground font-bold">eSewa</span>
                  </button>

                  <button
                    onClick={() => setSelectedGateway("KHALTI")}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      selectedGateway === "KHALTI" ? "border-purple-500 bg-purple-500/10 font-bold ring-2 ring-purple-500" : "bg-muted/20 border-border"
                    }`}
                  >
                    <span className="text-lg">🟣</span>
                    <span className="text-xs text-foreground font-bold">Khalti</span>
                  </button>

                  <button
                    onClick={() => setSelectedGateway("FONEPAY")}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      selectedGateway === "FONEPAY" ? "border-red-500 bg-red-500/10 font-bold ring-2 ring-red-500" : "bg-muted/20 border-border"
                    }`}
                  >
                    <span className="text-lg">🔴</span>
                    <span className="text-xs text-foreground font-bold">Fonepay QR</span>
                  </button>

                  <button
                    onClick={() => setSelectedGateway("CONNECTIPS")}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      selectedGateway === "CONNECTIPS" ? "border-blue-500 bg-blue-500/10 font-bold ring-2 ring-blue-500" : "bg-muted/20 border-border"
                    }`}
                  >
                    <span className="text-lg">🔵</span>
                    <span className="text-xs text-foreground font-bold">ConnectIPS</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Tax Breakdown Summary & Instant Sandbox Trigger */}
            <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
              <Card className="p-5 border bg-muted/20 space-y-3 shadow-inner">
                <span className="font-bold text-xs text-foreground">Order Summary & 13% Nepal VAT Breakdown</span>

                <div className="space-y-2 text-xs border-b pb-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Plan: {activePlan.name} ({billingCycle.toLowerCase()})</span>
                    <span>NPR {tax.baseAmountNpr.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Nepal 13% Value Added Tax (VAT)</span>
                    <span className="font-mono text-primary font-bold">+ NPR {tax.vatAmountNpr.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <span className="font-bold text-sm text-foreground">Total Payable Amount:</span>
                  <span className="text-xl font-extrabold text-foreground font-mono">
                    NPR {tax.totalAmountNpr.toFixed(2)}
                  </span>
                </div>
              </Card>

              <Button
                variant="nepal"
                size="lg"
                disabled={isProcessing}
                onClick={handleSimulatePayment}
                className="w-full text-xs font-bold gap-2 h-11 shadow-md"
              >
                <CreditCard className="h-4 w-4" />
                <span>{isProcessing ? "Preparing Sandbox Preview..." : `Preview ${selectedGateway} Checkout`}</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Recent 13% Nepal VAT Invoices */}
        <Card className="p-6 border bg-card space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Download className="h-4 w-4 text-primary" />
              <span>Illustrative Invoice Records</span>
            </div>
            <span className="text-xs text-muted-foreground">Demo data; not valid tax receipts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground font-semibold border-b">
                <tr>
                  <th className="p-3">Invoice No.</th>
                  <th className="p-3">Date (B.S.)</th>
                  <th className="p-3">Plan Details</th>
                  <th className="p-3">Gateway</th>
                  <th className="p-3">Base Price</th>
                  <th className="p-3">13% VAT</th>
                  <th className="p-3 font-bold">Illustrative Total</th>
                  <th className="p-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subscription.recentInvoices.map((inv) => (
                  <tr key={inv.invoiceNumber} className="hover:bg-muted/20 transition-all">
                    <td className="p-3 font-mono font-bold text-primary">{inv.invoiceNumber}</td>
                    <td className="p-3 font-mono text-muted-foreground">{inv.invoiceDateBs}</td>
                    <td className="p-3 font-semibold text-foreground">{inv.planName} ({inv.billingCycle})</td>
                    <td className="p-3">
                      <Badge variant="subtle" className="text-[10px]">{inv.paymentGateway}</Badge>
                    </td>
                    <td className="p-3 font-mono">NPR {inv.taxBreakdown.baseAmountNpr}</td>
                    <td className="p-3 font-mono text-primary font-semibold">NPR {inv.taxBreakdown.vatAmountNpr}</td>
                    <td className="p-3 font-mono font-bold text-foreground">NPR {inv.taxBreakdown.totalAmountNpr}</td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-primary gap-1">
                        <Download className="h-3 w-3" />
                        <span>Preview</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </StudentDashboardShell>
  );
}
