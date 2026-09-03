"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  AlertTriangle,
  Award,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getClassroomAnalytics, getMockClassSections } from "@/lib/teacher/analytics";

export default function TeacherAnalyticsPage() {
  const [selectedClassId, setSelectedClassId] = React.useState("class-8a");
  const classes = getMockClassSections();
  const analytics = getClassroomAnalytics(selectedClassId);
  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link
                  href="/teacher"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Teacher Workspace
                </Link>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Classroom Analytics Demonstration</h1>
              <p className="text-xs text-muted-foreground">
                Inspect seeded concept heatmaps, readiness distributions, and prerequisite alerts; these are not live class results.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:ring-2 focus:ring-primary"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.grade} • {cls.section} ({cls.subject})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Scorecard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>Class Mastery Average</span>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-600">{analytics.averageMastery}%</div>
              <Progress value={analytics.averageMastery} className="h-1.5" />
            </Card>

            <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>High Performers (90%+)</span>
                <Award className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold">{analytics.highPerformersCount} Students</div>
              <p className="text-[11px] text-muted-foreground">Exemplary Retention</p>
            </Card>

            <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>On Track (60–89%)</span>
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{analytics.onTrackCount} Students</div>
              <p className="text-[11px] text-emerald-600 font-semibold">Meeting BLE Standards</p>
            </Card>

            <Card className="p-4 border bg-card space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>Needs Support (&lt;60%)</span>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <div className="text-2xl font-bold text-destructive">{analytics.needsSupportCount} Students</div>
              <p className="text-[11px] text-muted-foreground">Prerequisite Intervention</p>
            </Card>
          </div>

          {/* Main Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Concept Difficulty Heatmap */}
            <div className="lg:col-span-6 space-y-4">
              <Card className="p-5 border bg-card space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>Curriculum Concept Mastery Heatmap</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    BLE Syllabus
                  </Badge>
                </div>

                <div className="space-y-3">
                  {analytics.conceptHeatmap.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">{item.chapter}</span>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={item.difficultyLevel === "Easy" ? "success" : item.difficultyLevel === "Medium" ? "outline" : "destructive"}
                            className="text-[10px]"
                          >
                            {item.difficultyLevel}
                          </Badge>
                          <span className="font-bold text-primary">{item.masteryScore}%</span>
                        </div>
                      </div>
                      <Progress value={item.masteryScore} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column: Student Roster with Prerequisite Gaps */}
            <div className="lg:col-span-6 space-y-4">
              <Card className="p-5 border bg-card space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span>Student Roster Performance</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{currentClass.roster.length} Listed</span>
                </div>

                <div className="space-y-2.5">
                  {currentClass.roster.map((std) => (
                    <div
                      key={std.id}
                      className="p-3 rounded-xl border bg-muted/20 flex items-center justify-between text-xs hover:bg-muted/40 transition-all"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">
                            #{std.rollNumber} {std.name}
                          </span>
                          {std.hasPrerequisiteGap && (
                            <Badge variant="destructive" className="text-[10px]">
                              Gap: {std.gapTopic}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground">{std.email}</span>
                      </div>

                      <div className="text-right space-y-0.5">
                        <div className="font-bold text-foreground">{std.masteryPercentage}% Mastery</div>
                        <span className="text-[10px] text-muted-foreground">{std.streakDays} Day Streak</span>
                      </div>
                    </div>
                  ))}
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
