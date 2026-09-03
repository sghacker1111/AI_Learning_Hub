import * as React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WCAG_SCORECARD } from "@/lib/accessibility/config";

export default function AccessibilityStatementPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <Badge variant="nepal" className="text-xs">
              Inclusive Education for Every Scholar
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Accessibility Implementation Status
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI Learning Nepal is committed to ensuring digital accessibility for all students, including those with visual impairments, dyslexia, motor challenges, and remote low-bandwidth conditions across Nepal.
            </p>
          </div>

          {/* Compliance Commitments */}
          <Card className="p-8 border bg-card space-y-6 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-base text-foreground border-b pb-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <span>Core Accessibility Standards & Implementation</span>
            </div>

            <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
              <p>
                The prototype includes accessibility controls intended to support WCAG 2.1 AA work. It has not completed a formal conformance audit or comprehensive testing with NVDA, JAWS, VoiceOver, and TalkBack.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-muted/30 border space-y-1.5">
                  <span className="font-bold text-foreground">📖 Dyslexia-Friendly Typography</span>
                  <p>OpenDyslexic and Lexend typeface support, custom letter-spacing expansion, and line height adjusters.</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border space-y-1.5">
                  <span className="font-bold text-foreground">⚡ High Contrast & Low Glare</span>
                  <p>High-contrast dark/light modes and warm amber reading backgrounds are available and still require route-by-route contrast testing.</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border space-y-1.5">
                  <span className="font-bold text-foreground">🎙️ Mathematical ARIA Verbalization</span>
                  <p>All STEM equations generate natural conversational screen reader text without confusing raw LaTeX code.</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border space-y-1.5">
                  <span className="font-bold text-foreground">⌨️ 100% Keyboard Navigable</span>
                  <p>Skip links, logical tab orders, focus trapping in modal dialogs, and high-visibility 4px focus rings.</p>
                </div>
              </div>
            </div>

            {/* WCAG Scorecard Table */}
            <div className="space-y-3 pt-4 border-t">
              <span className="font-bold text-xs text-foreground">Verification Scorecard</span>
              <div className="space-y-2">
                {WCAG_SCORECARD.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border bg-muted/20 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground">{item.criterion}</div>
                      <div className="text-[11px] text-muted-foreground">{item.description}</div>
                    </div>
                    <Badge variant="success" className="text-[10px] shrink-0">{item.score}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <Link href="/student/accessibility">
                <Button variant="nepal" className="text-xs font-semibold gap-1.5 h-9">
                  <span>Open Student Accessibility Settings</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
