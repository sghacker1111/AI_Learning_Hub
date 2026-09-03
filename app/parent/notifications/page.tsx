"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Smartphone,
  MessageSquare,
  Mail,
  Clock,
  Moon,
  Shield,
  Save,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MOCK_PARENT_SETTINGS } from "@/lib/parent/child-data";

export default function ParentNotificationsPage() {
  const [phoneNumber, setPhoneNumber] = React.useState(MOCK_PARENT_SETTINGS.parentPhoneNumber);
  const [whatsappEnabled, setWhatsappEnabled] = React.useState(MOCK_PARENT_SETTINGS.channels.whatsapp);
  const [smsEnabled, setSmsEnabled] = React.useState(MOCK_PARENT_SETTINGS.channels.sms);
  const [emailEnabled, setEmailEnabled] = React.useState(MOCK_PARENT_SETTINGS.channels.email);
  const [dailyLimit, setDailyLimit] = React.useState(MOCK_PARENT_SETTINGS.dailyStudyLimitMinutes.toString());
  const [bedtimeLock, setBedtimeLock] = React.useState(MOCK_PARENT_SETTINGS.bedtimeLockEnabled);
  const [bedtimeHour, setBedtimeHour] = React.useState(MOCK_PARENT_SETTINGS.bedtimeLockHour);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link
                  href="/parent"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Parent Hub
                </Link>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Parent Notification & Screen Time Controls</h1>
              <p className="text-xs text-muted-foreground">
                Preview notification and study-limit settings. Server-side persistence and message gateways are not configured.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="nepal" size="sm" onClick={handleSave} className="gap-1.5 text-xs font-semibold">
                <Save className="h-3.5 w-3.5" />
                <span>Update Local Preview</span>
              </Button>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-amber-600" />
              <span>Preview updated in this page only; settings were not saved or sent.</span>
            </div>
          )}

          {/* Section 1: Notification Channels */}
          <Card className="p-6 border bg-card space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Bell className="h-4 w-4 text-primary" />
                <span>Digest Notification Channels</span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                Preview Only
              </Badge>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Parent Mobile Number (WhatsApp & SMS)</label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-xs h-9 max-w-sm"
                  placeholder="+977-98XXXXXXXX"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div
                  onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                    whatsappEnabled ? "bg-emerald-500/10 border-emerald-500" : "bg-muted/20 border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <MessageSquare className="h-5 w-5 text-emerald-600" />
                    <span className={`text-[10px] font-bold ${whatsappEnabled ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {whatsappEnabled ? "PREVIEW ON" : "OFF"}
                    </span>
                  </div>
                  <div className="font-bold text-foreground">WhatsApp Weekly Digest</div>
                  <p className="text-[11px] text-muted-foreground">Full formatted visual card with BLE GPA.</p>
                </div>

                <div
                  onClick={() => setSmsEnabled(!smsEnabled)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                    smsEnabled ? "bg-blue-500/10 border-blue-500" : "bg-muted/20 border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                    <span className={`text-[10px] font-bold ${smsEnabled ? "text-blue-600" : "text-muted-foreground"}`}>
                      {smsEnabled ? "PREVIEW ON" : "OFF"}
                    </span>
                  </div>
                  <div className="font-bold text-foreground">Sparrow SMS Alert</div>
                  <p className="text-[11px] text-muted-foreground">160-character Devanagari text summary.</p>
                </div>

                <div
                  onClick={() => setEmailEnabled(!emailEnabled)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                    emailEnabled ? "bg-purple-500/10 border-purple-500" : "bg-muted/20 border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Mail className="h-5 w-5 text-purple-600" />
                    <span className={`text-[10px] font-bold ${emailEnabled ? "text-purple-600" : "text-muted-foreground"}`}>
                      {emailEnabled ? "PREVIEW ON" : "OFF"}
                    </span>
                  </div>
                  <div className="font-bold text-foreground">Email Summary Report</div>
                  <p className="text-[11px] text-muted-foreground">Detailed PDF report card attachment.</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 2: Screen Time & Bedtime Controls */}
          <Card className="p-6 border bg-card space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span>Screen Time & Healthy Study Limits</span>
              </div>
              <Badge variant="subtle" className="text-[10px]">
                Not Enforced
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Daily Study Target (Minutes)</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Recommended daily study target for Class 8 BLE candidates.
                </p>
                <Input
                  type="number"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(e.target.value)}
                  className="text-xs h-9 max-w-xs"
                />
              </div>

              <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <Moon className="h-4 w-4 text-purple-600" />
                    <span>Evening Bedtime Study Lock</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={bedtimeLock}
                    onChange={(e) => setBedtimeLock(e.target.checked)}
                    className="h-4 w-4 rounded text-primary focus:ring-primary"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Disables practice & AI tutoring after designated hour for healthy sleep.
                </p>
                <Input
                  type="time"
                  value={bedtimeHour}
                  onChange={(e) => setBedtimeHour(e.target.value)}
                  className="text-xs h-9 max-w-xs"
                />
              </div>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
