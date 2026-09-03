"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SUBSCRIPTION_PLANS, calculateNepalVAT } from "@/lib/billing/plans";
import { BillingCycle } from "@/lib/billing/types";

export default function PricingPage() {
  const [cycle, setCycle] = React.useState<BillingCycle>("MONTHLY");

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <Badge variant="nepal" className="text-xs">
              Prototype Pricing Preview (१३% illustrative VAT)
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Proposed Plans for the AI Learning Prototype
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              These plans demonstrate the intended product structure. Live payment processing, subscriptions, and the advertised production services are not enabled.
            </p>

            {/* Monthly vs Annual Toggle */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <div className="p-1 rounded-2xl bg-card border shadow-sm flex items-center gap-1">
                <button
                  onClick={() => setCycle("MONTHLY")}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    cycle === "MONTHLY"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly Billing
                </button>

                <button
                  onClick={() => setCycle("ANNUAL")}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    cycle === "ANNUAL"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>Annual Billing</span>
                  <Badge variant="success" className="text-[10px] py-0">Save 25%</Badge>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const price = cycle === "MONTHLY" ? plan.monthlyPriceNpr : plan.annualPriceNpr;
              const tax = calculateNepalVAT(price);

              return (
                <Card
                  key={plan.id}
                  className={`p-6 border transition-all flex flex-col justify-between space-y-6 ${
                    plan.isPopular
                      ? "border-2 border-primary bg-card shadow-xl relative"
                      : "bg-card shadow-sm hover:shadow-md"
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="nepal" className="text-[10px] font-bold uppercase tracking-wider">
                        Featured Preview
                      </Badge>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-foreground">{plan.name}</h3>
                      <p className="text-xs text-primary font-nepali font-semibold">{plan.nameNepali}</p>
                      <p className="text-xs text-muted-foreground pt-1">{plan.tagline}</p>
                    </div>

                    <div className="pt-2 border-t space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-foreground">
                          NPR {price.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {price === 0 ? "/ forever" : cycle === "MONTHLY" ? "/ month" : "/ year"}
                        </span>
                      </div>
                      {price > 0 && (
                        <p className="text-[10px] text-muted-foreground">
                          Base: NPR {tax.baseAmountNpr} + 13% VAT: NPR {tax.vatAmountNpr}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <span className="text-xs font-bold text-foreground">What&apos;s included:</span>
                      <ul className="space-y-2 text-xs text-muted-foreground">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="leading-snug">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Link href={`/student/billing?plan=${plan.id}&cycle=${cycle}`}>
                      <Button
                        variant={plan.isPopular ? "nepal" : "outline"}
                        className="w-full text-xs font-semibold gap-1.5 h-10"
                      >
                        <span>{price === 0 ? "Get Started Free" : "Upgrade Plan"}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Payment Gateways Support Footer */}
          <div className="p-6 rounded-2xl bg-card border text-center space-y-3 shadow-sm max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Payment Gateway Sandbox Previews</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                🟢 eSewa ePay v2
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                🟣 Khalti E-Payment v2
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20">
                🔴 Fonepay Dynamic QR
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                🔵 ConnectIPS (NCHL)
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              No live transaction processing or tax invoice issuance is configured. Prices and VAT breakdowns are illustrative.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
