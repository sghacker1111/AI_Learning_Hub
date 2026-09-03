"use client";

import { StudentDashboardShell } from "@/components/layout/student-dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function StudentProfilePage() {
  return (
    <StudentDashboardShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Student Profile Demonstration</h1>
          <p className="text-sm text-muted-foreground">
            This seeded profile is read-only and is not the authenticated account record.
          </p>
        </div>

        <Card className="border bg-card p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                AS
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold">Aayush Sharma</h2>
                <Badge variant="success" className="text-xs">Active Student</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Class 8 (BLE) • Student ID: STD-2081-0842</p>
              <p className="text-xs text-primary font-medium">Shree Shanti Vidya Niketan, Lalitpur</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
              <Input defaultValue="Aayush Sharma" disabled />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
              <Input defaultValue="aayush.sharma@example.com" disabled />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Assigned Grade</label>
              <Input defaultValue="Class 8 (कक्षा ८) - Basic Level" disabled />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Preferred Language</label>
              <Input defaultValue="Bilingual (English + Nepali)" disabled />
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <Button variant="outline" size="sm" disabled>Read-Only Demo</Button>
          </div>
        </Card>
      </div>
    </StudentDashboardShell>
  );
}
