"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Clock,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { getTeacherAssignments } from "@/lib/teacher/assignments";
import { TeacherAssignment } from "@/lib/teacher/types";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = React.useState<TeacherAssignment[]>(() => getTeacherAssignments());
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("Homework: Quadratic Factorization Practice");
  const [newSubject, setNewSubject] = React.useState("Compulsory Mathematics");
  const [newPoints, setNewPoints] = React.useState("20");
  const [newDueDate] = React.useState("In 2 Days");

  const handleCreateAssignment = () => {
    const parsedPoints = Number(newPoints);
    if (!newTitle.trim() || !Number.isInteger(parsedPoints) || parsedPoints < 1 || parsedPoints > 100) return;
    const newAsgn: TeacherAssignment = {
      id: `asgn-${Date.now()}`,
      title: newTitle,
      classSectionId: "class-8a",
      subject: newSubject,
      chapter: "Quadratic Factorization",
      totalPoints: parsedPoints,
      dueDate: newDueDate,
      submissionCount: 0,
      totalStudents: 38,
      status: "ACTIVE",
    };
    setAssignments((prev) => [newAsgn, ...prev]);
    setShowCreateModal(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
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
              <h1 className="text-2xl font-bold tracking-tight">Assignment Interface Demonstration</h1>
              <p className="text-xs text-muted-foreground">
                Add assignments to local page state and inspect seeded submissions. Nothing is distributed or persisted.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="nepal"
                size="sm"
                onClick={() => setShowCreateModal(true)}
                className="gap-1.5 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Local Preview</span>
              </Button>
            </div>
          </div>

          {/* Create Assignment Modal */}
          {showCreateModal && (
            <Card className="p-5 border-2 border-primary/30 bg-primary/5 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                <span className="font-bold text-sm text-primary">New Homework Assignment</span>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)} className="h-7 text-xs">
                  Cancel
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-muted-foreground">Assignment Title</label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs"
                  >
                    <option value="Compulsory Mathematics">Compulsory Mathematics</option>
                    <option value="Science & Technology">Science & Technology</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Total Points</label>
                  <Input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="nepal" size="sm" onClick={handleCreateAssignment} className="text-xs gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Assign to Class 8A</span>
                </Button>
              </div>
            </Card>
          )}

          {/* Assignments List */}
          <div className="space-y-4">
            {assignments.map((asgn) => {
              const submissionRate = Math.round((asgn.submissionCount / asgn.totalStudents) * 100);

              return (
                <Card key={asgn.id} className="p-6 border bg-card space-y-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={asgn.status === "ACTIVE" ? "nepal" : "outline"} className="text-[10px]">
                          {asgn.status}
                        </Badge>
                        <h3 className="font-bold text-base text-foreground">{asgn.title}</h3>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {asgn.subject} • Chapter: {asgn.chapter} ({asgn.totalPoints} Marks)
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        Due: {asgn.dueDate}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Submissions: <strong>{asgn.submissionCount} / {asgn.totalStudents} Students ({submissionRate}%)</strong>
                      </span>
                      <span className="text-emerald-600 font-semibold font-mono">
                        {asgn.submissionCount === asgn.totalStudents ? "All Graded" : "Auto-Grading Enabled"}
                      </span>
                    </div>
                    <Progress value={submissionRate} className="h-2" />
                  </div>
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
