"use client";

import Link from "next/link";
import { BookOpen, Bot } from "lucide-react";
import { StudentDashboardShell } from "@/components/layout/student-dashboard-shell";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MOCK_STUDENT_SUBJECTS } from "@/lib/constants/curriculum";

export default function StudentSubjectsPage() {
  return (
    <StudentDashboardShell>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="space-y-1">
          <Badge variant="subtle" className="text-xs">
            National Curriculum Framework
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight">
            Class 8 CDC Subjects Catalogue
          </h1>
          <p className="text-sm text-muted-foreground">
            Explore units, chapters, and approved textbook learning outcomes for all 5 core subjects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_STUDENT_SUBJECTS.map((subj) => (
            <Card key={subj.id} className="flex flex-col justify-between border bg-card hover:shadow-lg transition-all">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-xs">
                    {subj.code}
                  </Badge>
                  <span className="text-xs font-bold text-primary">
                    {subj.masteryPercentage}% Mastery
                  </span>
                </div>
                <CardTitle className="text-lg font-bold pt-2">{subj.name}</CardTitle>
                <p className="text-xs text-muted-foreground font-devanagari">
                  {subj.nameNepali}
                </p>
                <CardDescription className="text-xs pt-2">
                  {subj.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground border-y py-3">
                  <div>
                    <span className="font-semibold text-foreground">{subj.unitsCount}</span> Units
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">{subj.chaptersCount}</span> Chapters
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Syllabus Covered</span>
                    <span>{subj.masteryPercentage}%</span>
                  </div>
                  <Progress value={subj.masteryPercentage} />
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0 flex gap-2">
                <Link href={`/student/learning?subject=${subj.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    Chapters
                  </Button>
                </Link>
                <Link href={`/student/tutor?subject=${subj.id}`} className="flex-1">
                  <Button variant="nepal" size="sm" className="w-full text-xs gap-1.5">
                    <Bot className="h-3.5 w-3.5" />
                    AI Tutor
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </StudentDashboardShell>
  );
}
