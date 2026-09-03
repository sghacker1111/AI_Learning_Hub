"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  PlusCircle,
  ChevronRight,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface SubjectItem {
  id: string;
  code: string;
  name: string;
  nameNepali: string;
  creditHours: number;
  unitsCount: number;
  chaptersCount: number;
  lessonsCount: number;
}

const CLASS_8_SUBJECTS: SubjectItem[] = [
  {
    id: "mth-801",
    code: "MTH-801",
    name: "Compulsory Mathematics",
    nameNepali: "अनिवार्य गणित",
    creditHours: 5,
    unitsCount: 6,
    chaptersCount: 14,
    lessonsCount: 42,
  },
  {
    id: "sci-802",
    code: "SCI-802",
    name: "Science & Technology",
    nameNepali: "विज्ञान तथा प्रविधि",
    creditHours: 5,
    unitsCount: 5,
    chaptersCount: 12,
    lessonsCount: 36,
  },
  {
    id: "eng-803",
    code: "ENG-803",
    name: "English",
    nameNepali: "अंग्रेजी",
    creditHours: 4,
    unitsCount: 4,
    chaptersCount: 16,
    lessonsCount: 32,
  },
  {
    id: "nep-804",
    code: "NEP-804",
    name: "Nepali",
    nameNepali: "नेपाली",
    creditHours: 4,
    unitsCount: 4,
    chaptersCount: 18,
    lessonsCount: 36,
  },
  {
    id: "soc-805",
    code: "SOC-805",
    name: "Social Studies & Human Values",
    nameNepali: "सामाजिक अध्ययन तथा मानव मूल्य",
    creditHours: 4,
    unitsCount: 5,
    chaptersCount: 10,
    lessonsCount: 28,
  },
];

export default function GradeSubjectsPage() {
  const params = useParams();
  const gradeId = (params.gradeId as string) || "class-8";
  const gradeDisplayName = gradeId.replace("-", " ").toUpperCase();

  const [subjects, setSubjects] = React.useState<SubjectItem[]>(CLASS_8_SUBJECTS);
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [newCode, setNewCode] = React.useState("");
  const [newName, setNewName] = React.useState("");
  const [newNameNepali, setNewNameNepali] = React.useState("");
  const [newCredit, setNewCredit] = React.useState("4");

  const handleAddSubject = () => {
    if (!newCode || !newName) return;
    const newSubj: SubjectItem = {
      id: `subj-${Date.now()}`,
      code: newCode,
      name: newName,
      nameNepali: newNameNepali || newName,
      creditHours: parseInt(newCredit, 10) || 4,
      unitsCount: 0,
      chaptersCount: 0,
      lessonsCount: 0,
    };
    setSubjects((prev) => [...prev, newSubj]);
    setAddModalOpen(false);
    setNewCode("");
    setNewName("");
    setNewNameNepali("");
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
                  href="/admin/curriculum"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to All Grades
                </Link>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                {gradeDisplayName} — CDC Subjects Catalog
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage subject allocations, credit weights, and curriculum unit structures.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="nepal"
                size="sm"
                onClick={() => setAddModalOpen(true)}
                className="gap-1.5 text-xs"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Subject
              </Button>
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((s) => (
              <Card
                key={s.id}
                className="flex flex-col justify-between border bg-card hover:border-primary/50 hover:shadow-md transition-all group"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {s.code}
                    </Badge>
                    <Badge variant="nepal" className="text-[10px]">
                      {s.creditHours} Credit Hours
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                      {s.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-nepali">{s.nameNepali}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t text-center text-xs">
                    <div className="p-2 rounded-lg bg-muted/40">
                      <div className="font-bold text-foreground">{s.unitsCount}</div>
                      <div className="text-[10px] text-muted-foreground">Units</div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/40">
                      <div className="font-bold text-foreground">{s.chaptersCount}</div>
                      <div className="text-[10px] text-muted-foreground">Chapters</div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/40">
                      <div className="font-bold text-foreground">{s.lessonsCount}</div>
                      <div className="text-[10px] text-muted-foreground">Lessons</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link href={`/admin/curriculum/${gradeId}/${s.id}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs justify-between group-hover:bg-primary group-hover:text-primary-foreground">
                      <span>Explore Units & Chapters</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />

      {/* Add Subject Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <Card className="w-full max-w-md border bg-card p-6 space-y-4 shadow-2xl">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold">Add CDC Subject</CardTitle>
              <CardDescription className="text-xs">
                Register a new syllabus subject under {gradeDisplayName}.
              </CardDescription>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Subject Code (e.g. MTH-801)</label>
                <Input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="MTH-801"
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Subject Name (English)</label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Compulsory Mathematics"
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Subject Name (Nepali)</label>
                <Input
                  value={newNameNepali}
                  onChange={(e) => setNewNameNepali(e.target.value)}
                  placeholder="अनिवार्य गणित"
                  className="text-xs h-9 font-nepali"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Credit Hours</label>
                <Input
                  type="number"
                  value={newCredit}
                  onChange={(e) => setNewCredit(e.target.value)}
                  placeholder="4"
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="ghost" size="sm" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="nepal" size="sm" onClick={handleAddSubject}>
                Save Subject
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
