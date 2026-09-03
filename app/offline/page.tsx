"use client";

import * as React from "react";
import Link from "next/link";
import {
  WifiOff,
  BookOpen,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function OfflineFallbackPage() {
  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 border bg-card text-center space-y-6 shadow-lg">
        <div className="mx-auto w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
          <WifiOff className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <Badge variant="nepal" className="text-[10px]">
            Offline PWA Mode (अफलाइन मोड)
          </Badge>
          <h1 className="text-xl font-bold text-foreground">You are currently offline</h1>
          <p className="text-xs text-primary font-nepali font-semibold">
            तपाईंको इन्टरनेट सम्पर्क विच्छेद भएको छ।
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            AI Learning Nepal is fully functional offline. You can continue practicing your downloaded CDC chapter packs, solving BLE questions, and reviewing flashcards.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-muted/40 border text-xs text-left space-y-1.5 text-muted-foreground">
          <div className="font-bold text-foreground">Offline Capabilities Active:</div>
          <p>✓ Downloaded CDC Class 8 Math & Science Packs</p>
          <p>✓ Instant Local Evaluation & LaTeX Formatting</p>
          <p>✓ Background Sync Queue (Auto-syncs on reconnection)</p>
        </div>

        <div className="space-y-2 pt-2">
          <Link href="/student/offline" className="w-full">
            <Button variant="nepal" className="w-full text-xs gap-1.5 h-9 font-semibold">
              <BookOpen className="h-4 w-4" />
              <span>Open Downloaded Offline Lessons</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>

          <Button variant="outline" onClick={handleReload} className="w-full text-xs gap-1.5 h-9">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Check Connection & Reload</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
