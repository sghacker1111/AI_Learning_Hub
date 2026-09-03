"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Lock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getAuditLogs } from "@/lib/observability/audit";
import { AuditLogEntry } from "@/lib/observability/types";

export default function AdminAuditPage() {
  const [logs] = React.useState<AuditLogEntry[]>(() => getAuditLogs());
  const [filterAction, setFilterAction] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedLog, setSelectedLog] = React.useState<AuditLogEntry | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filterAction === "ALL" || log.action === filterAction;
    const matchesSearch =
      searchQuery === "" ||
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetResource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-muted/20 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/observability"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Observability
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Institutional Security & Compliance Audit Trail</h1>
          <p className="text-xs text-muted-foreground">
            Immutable log of all administrative actions, IEMIS roster modifications, role elevations, and exam publications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="nepal" className="text-[10px]">
            Demonstration Audit Records • Not a Compliance Certification
          </Badge>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border bg-card flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-80">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by actor, action, or resource..."
            className="h-8 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="h-8 rounded-xl border border-input bg-background px-3 text-xs font-semibold"
          >
            <option value="ALL">All Audit Actions</option>
            <option value="IEMIS_ROSTER_IMPORT">IEMIS Roster Imports</option>
            <option value="EXAM_PAPER_PUBLISHED">Exam Paper Publications</option>
            <option value="VAT_INVOICE_GENERATED">13% VAT Invoices</option>
            <option value="USER_ROLE_ELEVATION">Role Elevations</option>
            <option value="LESSON_PLAN_CREATED">Lesson Plan Generations</option>
          </select>
        </div>
      </Card>

      {/* Audit Trail Table */}
      <Card className="p-6 border bg-card space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3">
          <span className="font-bold text-sm text-foreground">Audit Log Records ({filteredLogs.length})</span>
          <span className="text-xs text-muted-foreground">Tamper-Evident SHA-256 Storage</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground font-semibold border-b">
              <tr>
                <th className="p-3">Log ID</th>
                <th className="p-3">Action Type</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Target Resource</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">Date (B.S.)</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/20 transition-all">
                  <td className="p-3 font-mono font-bold text-primary">{log.id}</td>
                  <td className="p-3">
                    <Badge variant="subtle" className="text-[10px]">{log.action}</Badge>
                  </td>
                  <td className="p-3 font-semibold text-foreground">
                    <div>{log.actorName}</div>
                    <div className="text-[10px] text-muted-foreground">{log.actorRole}</div>
                  </td>
                  <td className="p-3 text-muted-foreground max-w-xs truncate">{log.targetResource}</td>
                  <td className="p-3 font-mono text-[11px] text-muted-foreground">{log.ipAddress}</td>
                  <td className="p-3 font-mono text-muted-foreground">{log.timestampBs}</td>
                  <td className="p-3">
                    <Badge variant="success" className="text-[9px]">{log.status}</Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                      className="h-7 text-xs text-primary gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Inspect</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Selected Log Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 border bg-card space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Audit Record Inspector: {selectedLog.id}</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedLog(null)} className="h-7 w-7 p-0">
                ✕
              </Button>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              <p><strong>Action:</strong> {selectedLog.action}</p>
              <p><strong>Actor:</strong> {selectedLog.actorName} ({selectedLog.actorRole})</p>
              <p><strong>Resource:</strong> {selectedLog.targetResource}</p>
              <p><strong>IP & Location:</strong> {selectedLog.ipAddress}</p>
              <p><strong>Timestamp (B.S.):</strong> {selectedLog.timestampBs} ({selectedLog.timestamp})</p>
            </div>

            <div className="space-y-1 pt-2 border-t">
              <span className="font-bold text-xs text-foreground">Metadata Payload:</span>
              <pre className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed">
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)} className="text-xs">
                Close Inspector
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
