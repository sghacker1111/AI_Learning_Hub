"use client";

import { StudentDashboardShell } from "@/components/layout/student-dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function StudentSettingsPage() {
  return (
    <StudentDashboardShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Settings & Preference Preview</h1>
          <p className="text-sm text-muted-foreground">
            Theme selection is functional. Language, bandwidth, and parent-link settings are display-only in this prototype.
          </p>
        </div>

        <Card className="border bg-card p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <h3 className="text-sm font-semibold">Appearance & Theme</h3>
              <p className="text-xs text-muted-foreground">Toggle between Light, Dark, or System preference</p>
            </div>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <h3 className="text-sm font-semibold">AI Tutor Explanation Language</h3>
              <p className="text-xs text-muted-foreground">Choose your primary language for AI explanations</p>
            </div>
            <select className="h-9 rounded-lg border bg-background px-3 text-xs" disabled>
              <option value="bilingual">Bilingual (English + Nepali)</option>
              <option value="english">English Only</option>
              <option value="nepali">नेपाली मात्र</option>
            </select>
          </div>

          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <h3 className="text-sm font-semibold">Low-Bandwidth Mode (कम डेटा मोड)</h3>
              <p className="text-xs text-muted-foreground">Reduce image assets & animation overhead for slow connections</p>
            </div>
            <input type="checkbox" className="h-4 w-4 rounded text-primary" defaultChecked disabled />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Parent Link Status</h3>
              <p className="text-xs text-muted-foreground">Link guardian account for weekly study summaries</p>
            </div>
            <Badge variant="outline" className="text-xs">Sample: parent@demo.np</Badge>
          </div>
        </Card>
      </div>
    </StudentDashboardShell>
  );
}
