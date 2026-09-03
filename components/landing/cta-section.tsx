import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-16 sm:px-12 sm:py-20 text-white shadow-2xl">
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Development prototype with free demo access</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl leading-tight">
              Explore the Learning Prototype
            </h2>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Create a student or parent demo account to inspect the implemented Class 8 sample and clearly labeled preview modules.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-slate-950 hover:bg-slate-100 font-bold px-8 shadow-lg">
                  Create Demo Account
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/student/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10">
                  Explore Student Demo
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                <span>Unofficial Class 8 Sample</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HeartHandshake className="h-4 w-4 text-rose-400" />
                <span>Supports Nepali & English</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
