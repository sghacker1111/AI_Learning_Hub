"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Flame,
  Zap,
  Award,
  CheckCircle2,
  Lock,
  ArrowRight,
  Target,
  Mountain,
} from "lucide-react";
import { StudentDashboardShell } from "@/components/layout/student-dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getStudentGamificationProfile } from "@/lib/gamification/engine";
import { StudentGamificationProfile } from "@/lib/gamification/types";

export default function StudentQuestsPage() {
  const [profile] = React.useState<StudentGamificationProfile>(() =>
    getStudentGamificationProfile("student-demo-1", 1450)
  );
  const [activeTab, setActiveTab] = React.useState<"quests" | "badges" | "missions">("quests");

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
            <h1 className="text-2xl font-bold tracking-tight">Cultural Quests Demonstration</h1>
            <p className="text-xs text-muted-foreground">
              Preview seeded level progression, XP, cultural badges, and the Sagarmatha quest interface; changes are not persisted.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs font-bold text-orange-600">
              <Flame className="h-4 w-4 fill-orange-500" />
              <span>{profile.currentStreakDays} Day Streak ({profile.streakMultiplier}x XP)</span>
            </div>
          </div>
        </div>

        {/* Hero Level & XP Progression Banner */}
        <Card className="p-6 border bg-gradient-to-r from-primary/10 via-card to-amber-500/10 space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-3xl p-2.5 rounded-2xl bg-card border shadow-sm">
                {profile.currentLevel.badgeIcon}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Badge variant="nepal" className="text-[10px]">
                    Level {profile.currentLevel.levelNumber}
                  </Badge>
                  <h2 className="text-xl font-bold text-foreground">{profile.currentLevel.title}</h2>
                </div>
                <p className="text-xs text-primary font-nepali font-bold">
                  {profile.currentLevel.titleNepali} (विद्वान श्रेणी)
                </p>
              </div>
            </div>

            <div className="text-right space-y-0.5">
              <div className="flex items-center gap-1.5 justify-end text-sm font-bold text-foreground">
                <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>{profile.totalXp} Total XP</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Next Rank: <strong>{profile.nextLevel?.title || "Max Level"}</strong> (+{profile.xpToNextLevel} XP needed)
              </p>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>{profile.currentLevel.minXp} XP</span>
              <span>{profile.levelProgressPercentage}% Progress</span>
              <span>{profile.nextLevel?.minXp || 3000} XP</span>
            </div>
            <Progress value={profile.levelProgressPercentage} className="h-2.5" />
          </div>

          {/* Unlocked Perks */}
          <div className="pt-2 border-t flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Active Perks:</span>
            {profile.currentLevel.perks.map((perk, idx) => (
              <Badge key={idx} variant="subtle" className="text-[10px]">
                ✓ {perk}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b pb-2">
          <button
            onClick={() => setActiveTab("quests")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "quests"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mountain className="h-3.5 w-3.5" />
            <span>Cultural Quests (Sagarmatha Trail)</span>
          </button>

          <button
            onClick={() => setActiveTab("badges")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "badges"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Achievement Badges ({profile.unlockedBadgesCount}/{profile.totalBadgesCount})</span>
          </button>

          <button
            onClick={() => setActiveTab("missions")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "missions"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Target className="h-3.5 w-3.5" />
            <span>Daily Missions ({profile.dailyMissions.length})</span>
          </button>
        </div>

        {/* TAB 1: CULTURAL QUESTS (SAGARMATHA EXPEDITION) */}
        {activeTab === "quests" && (
          <div className="space-y-6">
            {profile.activeQuests.map((quest) => (
              <Card key={quest.id} className="p-6 border bg-card space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="nepal" className="text-[10px]">
                        Himalayan STEM Expedition
                      </Badge>
                      <h3 className="font-bold text-lg text-foreground">{quest.title}</h3>
                    </div>
                    <p className="text-xs text-primary font-nepali font-semibold">{quest.titleNepali}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">{quest.description}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
                    <Zap className="h-4 w-4" />
                    <span>+{quest.totalXpReward} Total XP Reward</span>
                  </div>
                </div>

                {/* Expedition Altitude Steps Stepper */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {quest.steps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                        step.isCompleted
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : step.stepNumber === 3
                          ? "bg-primary/10 border-primary/40 shadow-sm"
                          : "bg-muted/20 border-border opacity-70"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={step.isCompleted ? "success" : step.stepNumber === 3 ? "nepal" : "outline"}
                            className="text-[10px]"
                          >
                            {step.isCompleted ? "Conquered" : step.stepNumber === 3 ? "In Progress" : "Locked"}
                          </Badge>
                          {step.altitudeMeters && (
                            <span className="text-[10px] font-mono text-muted-foreground font-bold">
                              {step.altitudeMeters}m
                            </span>
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <h4 className="font-bold text-xs text-foreground leading-snug">{step.title}</h4>
                          <p className="text-[11px] text-primary font-nepali font-semibold">{step.titleNepali}</p>
                        </div>

                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                          {step.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-600 text-[11px]">+{step.xpReward} XP</span>
                        {step.isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : step.stepNumber === 3 ? (
                          <Link href={step.targetUrl}>
                            <Button variant="nepal" size="sm" className="h-7 text-xs gap-1">
                              <span>Climb</span>
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 2: CULTURAL ACHIEVEMENT BADGES */}
        {activeTab === "badges" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold">Academic & Cultural Achievement Badges</span>
              <span>Earn badges through continuous practice and mastery</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {profile.badges.map((badge) => (
                <Card
                  key={badge.id}
                  className={`p-5 border transition-all space-y-3 flex flex-col justify-between ${
                    badge.isUnlocked
                      ? "bg-card border-amber-500/40 shadow-sm hover:shadow-md"
                      : "bg-muted/20 border-border opacity-75"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{badge.icon}</span>
                      <Badge
                        variant={badge.isUnlocked ? "nepal" : "outline"}
                        className="text-[10px]"
                      >
                        {badge.rarity}
                      </Badge>
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="font-bold text-sm text-foreground">{badge.title}</h4>
                      <p className="text-xs text-primary font-nepali font-semibold">{badge.titleNepali}</p>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">{badge.description}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">{badge.requirementText}</span>
                      <span className="font-bold text-primary">{badge.progressPercentage}%</span>
                    </div>
                    <Progress value={badge.progressPercentage} className="h-1.5" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DAILY MISSIONS */}
        {activeTab === "missions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold">Today&apos;s Daily Learning Missions</span>
              <span>Resets daily at 00:00 NPT</span>
            </div>

            <div className="space-y-3">
              {profile.dailyMissions.map((mis) => (
                <Card key={mis.id} className="p-4 border bg-card space-y-3 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={mis.isCompleted ? "success" : "outline"} className="text-[10px]">
                        {mis.isCompleted ? "Completed" : "In Progress"}
                      </Badge>
                      <h4 className="font-bold text-sm text-foreground">{mis.title}</h4>
                    </div>
                    <p className="text-xs text-primary font-nepali font-medium">{mis.titleNepali}</p>
                    <span className="text-xs text-muted-foreground">
                      Progress: {mis.currentCount} / {mis.targetCount}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xs text-amber-600">+{mis.xpReward} XP</span>
                    <Link href={mis.targetUrl}>
                      <Button
                        variant={mis.isCompleted ? "outline" : "nepal"}
                        size="sm"
                        className="text-xs gap-1 h-8"
                      >
                        <span>{mis.isCompleted ? "Review" : "Continue"}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </StudentDashboardShell>
  );
}
