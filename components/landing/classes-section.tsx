"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, School } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CDC_GRADES, LEVEL_TABS } from "@/lib/constants/curriculum";

export function ClassesSection() {
  const [selectedLevel, setSelectedLevel] = React.useState<string>("all");

  const filteredGrades = React.useMemo(() => {
    if (selectedLevel === "all") return CDC_GRADES;
    return CDC_GRADES.filter((g) => g.level === selectedLevel);
  }, [selectedLevel]);

  return (
    <section id="classes" className="py-20 bg-muted/20 border-y">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <Badge variant="subtle" className="px-3 py-1 text-xs font-semibold">
            Grade Catalog & Content Status
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Browse the Planned Grade Structure
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Grade names and proposed learning areas span Nursery to Class 12. Only a small,
            editorially unverified Class 8 sample is bundled in this repository.
          </p>

          {/* Level Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {LEVEL_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedLevel(tab.id)}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                  selectedLevel === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                    : "bg-background border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredGrades.map((grade) => (
            <Card
              key={grade.id}
              className="flex flex-col justify-between overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group bg-card"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{grade.levelLabel}</span>
                  <Badge variant="outline" className="text-[11px] font-mono">
                    {grade.ageRange}
                  </Badge>
                </div>
                <div className="pt-2 flex items-baseline justify-between">
                  <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
                    {grade.name}
                  </CardTitle>
                  <span className="text-lg font-devanagari font-semibold text-muted-foreground">
                    {grade.nameNepali}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-3 flex-1">
                <CardDescription className="text-xs line-clamp-2">
                  Proposed learning areas: {grade.description}
                </CardDescription>

                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    {grade.subjectsCount} Planned Subjects
                  </span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Catalog Preview
                  </span>
                </div>
              </CardContent>

              <CardFooter className="p-5 pt-0">
                {grade.id === "class-8" ? (
                  <Link href="/register?grade=class-8" className="w-full">
                    <Button variant="outline" size="sm" className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <span>Open Class 8 Demo</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Content Not Bundled
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-red-600/10 via-blue-600/10 to-indigo-600/10 border p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow">
              <School className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-base">Looking for School or Institutional Enrollment?</h4>
              <p className="text-xs text-muted-foreground">
                Preview school, teacher, roster, and practice-paper interfaces. Live institutional onboarding is not configured.
              </p>
            </div>
          </div>
          <Link href="/pricing" className="shrink-0">
            <Button variant="nepal" size="sm">
              View Plan Previews
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
