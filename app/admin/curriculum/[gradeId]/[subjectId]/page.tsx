"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  ChevronDown,
  ChevronRight,
  FileText,
  Edit,
  FolderOpen,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LessonData {
  id: string;
  lessonNumber: number;
  title: string;
  titleNepali: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "PUBLISHED";
  outcomeCode: string;
}

interface ChapterData {
  id: string;
  chapterNumber: number;
  title: string;
  titleNepali: string;
  lessons: LessonData[];
}

interface UnitData {
  id: string;
  unitNumber: number;
  title: string;
  titleNepali: string;
  chapters: ChapterData[];
}

const SAMPLE_UNITS: UnitData[] = [
  {
    id: "u-1",
    unitNumber: 1,
    title: "Sets",
    titleNepali: "समुह",
    chapters: [
      {
        id: "c-1",
        chapterNumber: 1,
        title: "Overlapping Sets & Cardinality Formulas",
        titleNepali: "खप्टिएका समूहहरू र गणनात्मकता सूत्र",
        lessons: [
          {
            id: "les-1",
            lessonNumber: 1,
            title: "Cardinality of Two Overlapping Sets",
            titleNepali: "दुई खप्टिएका समूहहरूको गणनात्मकता",
            status: "PUBLISHED",
            outcomeCode: "LO-MTH801-1.1",
          },
          {
            id: "les-2",
            lessonNumber: 2,
            title: "Venn Diagram Construction for Complement Regions",
            titleNepali: "पूरक क्षेत्रहरूको लागि भेन्चित्र निर्माण",
            status: "PUBLISHED",
            outcomeCode: "LO-MTH801-1.2",
          },
        ],
      },
      {
        id: "c-2",
        chapterNumber: 2,
        title: "Cardinality of Three Sets (Introduction)",
        titleNepali: "तीन समूहको गणनात्मकता (परिचय)",
        lessons: [
          {
            id: "les-3",
            lessonNumber: 1,
            title: "Three Overlapping Sets Representation",
            titleNepali: "तीन खप्टिएका समूहहरूको प्रतिनिधित्व",
            status: "APPROVED",
            outcomeCode: "LO-MTH801-1.3",
          },
        ],
      },
    ],
  },
  {
    id: "u-2",
    unitNumber: 2,
    title: "Arithmetic (Profit, Loss & VAT)",
    titleNepali: "अङ्कगणित",
    chapters: [
      {
        id: "c-3",
        chapterNumber: 1,
        title: "Profit, Loss & Value Added Tax (VAT)",
        titleNepali: "नाफा, नोक्सान र मूल्य अभिवृद्धि कर",
        lessons: [
          {
            id: "les-4",
            lessonNumber: 1,
            title: "Calculation of 13% Value Added Tax (VAT)",
            titleNepali: "मूल्य अभिवृद्धि कर (VAT) को गणना",
            status: "APPROVED",
            outcomeCode: "LO-MTH801-2.1",
          },
          {
            id: "les-5",
            lessonNumber: 2,
            title: "Discount with VAT Problems",
            titleNepali: "छुट र भ्याटसम्बन्धी समस्या",
            status: "UNDER_REVIEW",
            outcomeCode: "LO-MTH801-2.2",
          },
        ],
      },
    ],
  },
  {
    id: "u-4",
    unitNumber: 4,
    title: "Algebra (Factorization)",
    titleNepali: "बीजगणित",
    chapters: [
      {
        id: "c-4",
        chapterNumber: 1,
        title: "Factorization of Polynomials",
        titleNepali: "बीजीय व्यञ्जकको खण्डीकरण",
        lessons: [
          {
            id: "les-6",
            lessonNumber: 1,
            title: "Factorization of Quadratic Trinomials ax² + bx + c",
            titleNepali: "द्विघातीय त्रिपदीय व्यञ्जकको खण्डीकरण",
            status: "DRAFT",
            outcomeCode: "LO-MTH801-4.1",
          },
        ],
      },
    ],
  },
];

export default function SubjectUnitsTreePage() {
  const params = useParams();
  const gradeId = (params.gradeId as string) || "class-8";
  const subjectId = (params.subjectId as string) || "mth-801";

  const units = SAMPLE_UNITS;
  const [expandedUnits, setExpandedUnits] = React.useState<Record<string, boolean>>({ "u-1": true, "u-2": true, "u-4": true });

  const toggleUnit = (id: string) => {
    setExpandedUnits((prev) => ({ ...prev, [id]: !prev[id] }));
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
                <Link
                  href={`/admin/curriculum/${gradeId}`}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Grade Subjects
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-mono">
                  {subjectId.toUpperCase()}
                </Badge>
                <h1 className="text-2xl font-bold tracking-tight">Units, Chapters & Lessons Explorer</h1>
              </div>
              <p className="text-xs text-muted-foreground">
                Structured CDC hierarchy aligned with Specification Grid and Learning Outcomes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/admin/curriculum/editor">
                <Button variant="nepal" size="sm" className="gap-1.5 text-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  Open Full Editor
                </Button>
              </Link>
            </div>
          </div>

          {/* Units Hierarchy Accordion / Tree */}
          <div className="space-y-4">
            {units.map((u) => {
              const isExpanded = !!expandedUnits[u.id];
              return (
                <Card key={u.id} className="border bg-card overflow-hidden">
                  <button
                    onClick={() => toggleUnit(u.id)}
                    className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                        U{u.unitNumber}
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-foreground">{u.title}</h2>
                        <p className="text-xs text-muted-foreground font-nepali">{u.titleNepali}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-[10px]">
                        {u.chapters.length} Chapters
                      </Badge>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 space-y-4 divide-y">
                      {u.chapters.map((ch) => (
                        <div key={ch.id} className="pt-3 first:pt-0 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FolderOpen className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold text-xs text-foreground">
                                Chapter {ch.chapterNumber}: {ch.title}
                              </span>
                              <span className="text-[11px] text-muted-foreground font-nepali">
                                ({ch.titleNepali})
                              </span>
                            </div>
                          </div>

                          {/* Lessons under Chapter */}
                          <div className="pl-6 space-y-2">
                            {ch.lessons.map((les) => {
                              let statusBadge = <Badge variant="success">Published</Badge>;
                              if (les.status === "DRAFT") {
                                statusBadge = <Badge variant="outline">Draft</Badge>;
                              } else if (les.status === "SUBMITTED") {
                                statusBadge = <Badge variant="secondary">Submitted</Badge>;
                              } else if (les.status === "UNDER_REVIEW") {
                                statusBadge = <Badge variant="subtle">Under Review</Badge>;
                              } else if (les.status === "APPROVED") {
                                statusBadge = <Badge variant="nepal">Approved</Badge>;
                              }

                              return (
                                <div
                                  key={les.id}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <div className="font-medium text-xs text-foreground">
                                        Lesson {les.lessonNumber}: {les.title}
                                      </div>
                                      <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                                        <span className="font-mono text-primary font-semibold">
                                          {les.outcomeCode}
                                        </span>
                                        <span>•</span>
                                        <span className="font-nepali">{les.titleNepali}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 self-end sm:self-center">
                                    {statusBadge}
                                    <Link href={`/admin/curriculum/editor?lessonId=${les.id}`}>
                                      <Button variant="ghost" size="sm" className="h-7 text-xs px-2 gap-1 text-primary">
                                        <Edit className="h-3 w-3" />
                                        Edit
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
