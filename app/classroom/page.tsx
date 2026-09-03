"use client";

import * as React from "react";
import Link from "next/link";
import {
  Video,
  Users,
  ArrowRight,
  Play,
  Clock,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ClassroomLobbyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="nepal" className="text-[10px]">
                  Classroom Interface Demonstration
                </Badge>
                <span className="text-xs text-muted-foreground">Shree Shanti Secondary School</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Classroom & Whiteboard Prototype</h1>
              <p className="text-xs text-muted-foreground">
                Explore local-only whiteboard, chat, poll, and co-teacher interface states. No live media or multi-user transport is connected.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/classroom/room-8a-math">
                <Button variant="nepal" size="sm" className="gap-1.5 text-xs font-semibold">
                  <Play className="h-3.5 w-3.5" />
                  <span>Open Class 8A Interface Demo</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Active Live Rooms Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Bundled Classroom Samples</span>
              <span>2 static room scenarios • no streaming</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card className="p-6 border-2 border-emerald-500/40 bg-card space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-pulse">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
                      INTERFACE SAMPLE
                    </span>
                    <Badge variant="subtle" className="text-[10px]">
                      Class 8 • Section A
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-foreground">
                      Compulsory Mathematics: 13% Nepal VAT & Discount Masterclass
                    </h3>
                    <p className="text-xs text-primary font-nepali font-semibold">
                      कक्षा ८ &apos;क&apos;: १३% मूल्य अभिवृद्धि कर प्रत्यक्ष सिकाइ
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span>Teacher: <strong>Dr. Ram Prasad Subedi</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> 38 Students
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-end">
                  <Link href="/classroom/room-8a-math" className="w-full">
                    <Button variant="nepal" size="sm" className="w-full text-xs gap-1.5 h-9">
                      <Video className="h-3.5 w-3.5" />
                      <span>Open Interface Demo</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-6 border bg-card space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                      <Clock className="h-3.5 w-3.5" />
                      SECOND SAMPLE
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      Class 8 • Section B
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-foreground">
                      Science: Archimedes&apos; Principle & Eureka Can Upthrust Lab
                    </h3>
                    <p className="text-xs text-primary font-nepali font-semibold">
                      विज्ञान: तरल पदार्थको चाप र आर्किमिडिज सिद्धान्त
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span>Teacher: <strong>Sita Karki</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> 36 Registered
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-end">
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-9" disabled>
                    <Clock className="h-3.5 w-3.5" />
                    <span>Preview Not Implemented</span>
                  </Button>
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
