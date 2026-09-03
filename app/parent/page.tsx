"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  Flame,
  Award,
  Send,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MOCK_CHILDREN_PROFILES } from "@/lib/parent/child-data";
import { generateWhatsAppDigest, generateSMSDigest } from "@/lib/parent/notifications";

export default function ParentDashboardPage() {
  const [selectedChildId, setSelectedChildId] = React.useState("child-aarav");
  const [dispatchStatus, setDispatchStatus] = React.useState<string | null>(null);

  const selectedChild = MOCK_CHILDREN_PROFILES.find((c) => c.id === selectedChildId) || MOCK_CHILDREN_PROFILES[0];
  const whatsappDigest = generateWhatsAppDigest(selectedChild);
  const smsDigest = generateSMSDigest(selectedChild);

  const handleSimulateDispatch = () => {
    setDispatchStatus("Notification gateways are not configured. This is a digest preview and no message was sent.");
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="nepal" className="text-[10px]">
                  Parent Portal Demonstration
                </Badge>
                <span className="text-xs text-muted-foreground">{selectedChild.schoolName}</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Parent Learning Supervision & Digest Hub</h1>
              <p className="text-xs text-muted-foreground">
                Preview mock learning progress and weekly WhatsApp/SMS digest formatting in Devanagari Nepali.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Child Switcher */}
              <div className="flex items-center gap-2 p-1.5 rounded-2xl border bg-card shadow-sm">
                <Users className="h-4 w-4 text-primary ml-1.5" />
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="h-8 rounded-xl border-none bg-transparent px-2 text-xs font-bold focus:ring-0"
                >
                  {MOCK_CHILDREN_PROFILES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.grade})
                    </option>
                  ))}
                </select>
              </div>

              <Link href="/parent/notifications">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Bell className="h-3.5 w-3.5" />
                  <span>Settings</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Top Telemetry Scorecard for Selected Child */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>Weekly Study Time</span>
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{selectedChild.weeklyStudyHours} Hours</div>
              <p className="text-[11px] text-emerald-600 font-semibold">Meeting Weekly Study Goal</p>
            </Card>

            <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>Learning Streak</span>
                <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-orange-600">{selectedChild.currentStreakDays} Days</div>
              <p className="text-[11px] text-muted-foreground">Continuous Practice</p>
            </Card>

            <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>Overall Curriculum Mastery</span>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">{selectedChild.overallMasteryPercentage}%</div>
              <Progress value={selectedChild.overallMasteryPercentage} className="h-1.5" />
            </Card>

            <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>Estimated Board GPA</span>
                <Award className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">{selectedChild.estimatedGpa.toFixed(2)} (A)</div>
              <p className="text-[11px] text-emerald-600 font-semibold">{selectedChild.recentExamScore.slice(0, 16)}</p>
            </Card>
          </div>

          {/* Main Content Split Screen */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Academic Highlights & Live Activity Timeline */}
            <div className="lg:col-span-6 space-y-4">
              {/* Mastered & Focus Areas Card */}
              <Card className="p-5 border bg-card space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-bold text-sm text-foreground">Weekly Academic Mastery Highlights</span>
                  <Badge variant="outline" className="text-[10px]">
                    Week 1
                  </Badge>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1.5">
                    <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mastered Concepts This Week:
                    </span>
                    <ul className="space-y-1 pl-5 list-disc text-muted-foreground leading-relaxed">
                      {selectedChild.masteredTopicsThisWeek.map((topic, idx) => (
                        <li key={idx} className="font-medium text-foreground">{topic}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t">
                    <span className="font-bold text-amber-600 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" /> Recommended Focus Areas for Parents:
                    </span>
                    <ul className="space-y-1 pl-5 list-disc text-muted-foreground leading-relaxed">
                      {selectedChild.focusAreasNeedingSupport.map((topic, idx) => (
                        <li key={idx} className="font-medium text-foreground">{topic}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Recent Activity Timeline */}
              <Card className="p-5 border bg-card space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-bold text-sm text-foreground">Live Child Activity Feed</span>
                  <span className="text-xs text-muted-foreground">Real-time Telemetry</span>
                </div>

                <div className="space-y-2.5">
                  {selectedChild.recentActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl border bg-muted/20 flex items-center justify-between text-xs hover:bg-muted/40 transition-all"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Badge variant="subtle" className="text-[10px]">
                            {act.type}
                          </Badge>
                          <span className="font-bold text-foreground">{act.title}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {act.subject} • {act.timestamp}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-primary text-[11px] font-mono">{act.scoreOrDuration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column: Live WhatsApp & SMS Digest Preview Simulator */}
            <div className="lg:col-span-6 space-y-4">
              <Card className="p-6 border bg-card space-y-5 shadow-md">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                    <span>WhatsApp Progress Card (साप्ताहिक प्रतिवेदन)</span>
                  </div>
                  <Badge variant="nepal" className="text-[10px]">
                    Auto-Dispatched Sundays
                  </Badge>
                </div>

                {/* WhatsApp Chat Bubble Mockup */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 font-mono text-xs leading-relaxed space-y-2 text-foreground whitespace-pre-line shadow-inner overflow-x-auto">
                  {whatsappDigest.formattedWhatsAppText}
                </div>

                {/* Sparrow SMS Compact Preview */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="h-3.5 w-3.5 text-blue-600" />
                      Sparrow SMS Compact Gateway (१६० वर्ण)
                    </span>
                    <span>{smsDigest.charCountNepali} Chars</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border text-xs text-muted-foreground leading-relaxed">
                    {smsDigest.messageNepali}
                  </div>
                </div>

                {/* Dispatch Simulator Button */}
                <div className="pt-2">
                  <Button
                    variant="nepal"
                    size="sm"
                    onClick={handleSimulateDispatch}
                    className="w-full text-xs font-semibold gap-1.5 h-9"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Simulate Sending Weekly Digest to Parent Phone</span>
                  </Button>

                  {dispatchStatus && (
                    <p className="text-[11px] text-emerald-600 text-center font-semibold pt-2 animate-in fade-in">
                      {dispatchStatus}
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
