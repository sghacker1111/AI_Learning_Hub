"use client";

import * as React from "react";
import Link from "next/link";
import {
  RefreshCw,
  ArrowLeft,
  Upload,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MOCK_IEMIS_STUDENTS, validateIEMISCode } from "@/lib/school/iemis";
import { IEMISStudentRecord } from "@/lib/school/types";

export default function SchoolIEMISPage() {
  const [iemisCode, setIemisCode] = React.useState("270104001");
  const [students] = React.useState<IEMISStudentRecord[]>(MOCK_IEMIS_STUDENTS);
  const [syncStatus, setSyncStatus] = React.useState<string | null>(null);

  const codeValidation = validateIEMISCode(iemisCode);

  const handleCloudSync = () => {
    setSyncStatus("No ministry IEMIS connection is configured. No records were synchronized.");
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
                  href="/school"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to School Workspace
                </Link>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">IEMIS Format Demonstration</h1>
              <p className="text-xs text-muted-foreground">
                Validate sample 9-digit formatting and inspect a mock roster. No Ministry service connection is configured.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="nepal"
                size="sm"
                onClick={handleCloudSync}
                className="gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Check Sync Availability</span>
              </Button>
            </div>
          </div>

          {/* Sync Status Banner */}
          {syncStatus && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
              <span>{syncStatus}</span>
            </div>
          )}

          {/* IEMIS Code Validator & Code Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 border bg-card space-y-3 shadow-sm md:col-span-2">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-xs text-foreground">9-Digit IEMIS School Code Configuration</span>
                <Badge variant={codeValidation.isValid ? "nepal" : "destructive"} className="text-[10px]">
                  {codeValidation.isValid ? "Valid Format" : "Invalid Format"}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <Input
                  value={iemisCode}
                  onChange={(e) => setIemisCode(e.target.value)}
                  className="font-mono text-sm tracking-widest max-w-xs font-bold"
                  placeholder="270104001"
                />
                <Button variant="outline" size="sm" className="text-xs">
                  Validate Code
                </Button>
              </div>

              {codeValidation.isValid && (
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-1">
                  <span>District: <strong>Kathmandu (Code: {codeValidation.districtCode})</strong></span>
                  <span>•</span>
                  <span>Municipality: <strong>Kathmandu Met. (Code: {codeValidation.municipalityCode})</strong></span>
                  <span>•</span>
                  <span>Serial: <strong>#{codeValidation.schoolSerial}</strong></span>
                </div>
              )}
            </Card>

            <Card className="p-5 border bg-card space-y-3 shadow-sm flex flex-col justify-between">
              <div className="space-y-1">
                <span className="font-bold text-xs text-foreground">Bulk Excel / CSV Roster Upload</span>
                <p className="text-[11px] text-muted-foreground">
                  Ingest student records with Bikram Sambat dates and Devanagari names.
                </p>
              </div>

              <Button variant="outline" size="sm" disabled className="gap-1.5 text-xs w-full">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Not Configured</span>
              </Button>
            </Card>
          </div>

          {/* Synced IEMIS Student Roster Table */}
          <Card className="p-6 border bg-card space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                <span>Mock IEMIS-Format Student Records</span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {students.length} Demo Entries
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground font-semibold border-b">
                  <tr>
                    <th className="p-3">IEMIS Student ID</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Devanagari Name</th>
                    <th className="p-3">DOB (B.S.)</th>
                    <th className="p-3">Grade & Section</th>
                    <th className="p-3">Roll No.</th>
                    <th className="p-3">Parent Contact</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map((std) => (
                    <tr key={std.iemisStudentId} className="hover:bg-muted/20 transition-all">
                      <td className="p-3 font-mono font-bold text-primary">{std.iemisStudentId}</td>
                      <td className="p-3 font-semibold text-foreground">{std.name}</td>
                      <td className="p-3 font-nepali font-semibold text-primary">{std.nameNepali}</td>
                      <td className="p-3 font-mono text-muted-foreground">{std.dobBs}</td>
                      <td className="p-3">
                        <Badge variant="subtle" className="text-[10px]">
                          {std.grade} • {std.section}
                        </Badge>
                      </td>
                      <td className="p-3 font-bold">#{std.rollNumber}</td>
                      <td className="p-3 text-muted-foreground">
                        {std.parentName} ({std.parentPhone})
                      </td>
                      <td className="p-3 text-right">
                        <Badge variant="success" className="text-[10px]">
                          {std.syncStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
