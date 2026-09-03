"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { SchoolDirectory } from "@/components/admin/school-directory";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SCHOOL_BUNDLES } from "@/lib/billing/school-bundles";

interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "HIDDEN" | "ARCHIVED" | "SUSPENDED";
  role: "SUPER_ADMIN" | "SCHOOL_ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  createdAt: string;
  schoolName: string;
  bundleCode?: string;
  subscriptionStatus?: string;
}

const ROLES_LIST = [
  "ALL",
  "SUPER_ADMIN",
  "SCHOOL_ADMIN",
  "TEACHER",
  "STUDENT",
  "PARENT",
];

const STATUSES_LIST = ["ALL", "ACTIVE", "HIDDEN", "ARCHIVED", "SUSPENDED"];

export function AdminUsersPanel({ section = "users" }: { section?: "users" | "students" | "teachers" | "schools" }) {
  const fixedRole = section === "students" ? "STUDENT" : section === "teachers" ? "TEACHER" : section === "schools" ? "SCHOOL_ADMIN" : "ALL";
  const title = { users: "Login Users", students: "Students", teachers: "Teachers", schools: "School" }[section];
  const [users, setUsers] = React.useState<AdminUserItem[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("ALL");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 5;

  // Selected user for status/role modal
  const [selectedUser, setSelectedUser] = React.useState<AdminUserItem | null>(null);
  const [statusAction, setStatusAction] = React.useState<"status" | "role" | null>(null);
  const [newStatus, setNewStatus] = React.useState<AdminUserItem["status"]>("ACTIVE");
  const [newRole, setNewRole] = React.useState<AdminUserItem["role"]>("STUDENT");
  const [auditReason, setAuditReason] = React.useState("");
  const [successBanner, setSuccessBanner] = React.useState<string | null>(null);
  const [errorBanner, setErrorBanner] = React.useState<string | null>(null);
  const [showProvisionSchool, setShowProvisionSchool] = React.useState(false);
  const [provisioning, setProvisioning] = React.useState(false);
  const [schoolForm, setSchoolForm] = React.useState({
    schoolName: "",
    schoolCode: "",
    schoolEmail: "",
    address: "",
    district: "",
    adminName: "",
    adminEmail: "",
    password: "",
    bundleCode: "FULL_SCHOOL_AI",
    billingCycle: "ANNUAL",
    subscriptionStatus: "TRIALING",
  });

  React.useEffect(() => {
    let active = true;
    fetch("/api/admin/users?limit=100", { cache: "no-store" })
      .then(async (response) => ({ response, data: await response.json() }))
      .then(({ response, data }) => {
        if (!active) return;
        if (!response.ok) throw new Error(data.error || "Users could not be loaded.");
        setUsers(data.users ?? []);
        setLoaded(true);
      })
      .catch((error) => {
        if (active) setErrorBanner(error instanceof Error ? error.message : "Users could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, []);

  // Filter logic
  const filteredUsers = React.useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.schoolName.toLowerCase().includes(search.toLowerCase());

      const matchRole = (fixedRole === "ALL" || u.role === fixedRole) && (roleFilter === "ALL" || u.role === roleFilter);
      const matchStatus = statusFilter === "ALL" || u.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter, fixedRole]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleUpdateStatus = async () => {
    if (!selectedUser) return;
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, reason: auditReason }),
      });
      const result = await response.json();
      if (!response.ok || result.demo) throw new Error(result.error || "The database did not save this change.");

      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, status: newStatus } : u))
      );

      setSuccessBanner(`Updated ${selectedUser.name}'s status to ${newStatus}. Logged to Audit Trail.`);
      setSelectedUser(null);
      setStatusAction(null);
      setAuditReason("");
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (error) { setErrorBanner(error instanceof Error ? error.message : "The change could not be saved."); }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const result = await response.json();
      if (!response.ok || result.demo) throw new Error(result.error || "The database did not save this change.");

      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u))
      );

      setSuccessBanner(`Assigned new role ${newRole} to ${selectedUser.name}. Logged to Audit Trail.`);
      setSelectedUser(null);
      setStatusAction(null);
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (error) { setErrorBanner(error instanceof Error ? error.message : "The change could not be saved."); }
  };

  const handleProvisionSchool = async (event: React.FormEvent) => {
    event.preventDefault();
    setProvisioning(true);
    setErrorBanner(null);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schoolForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "School account could not be created.");
      setUsers((current) => [data.user, ...current]);
      setSuccessBanner(`Created ${data.user.schoolName} with ${data.user.bundleCode}.`);
      setShowProvisionSchool(false);
      setSchoolForm((current) => ({ ...current, schoolName: "", schoolCode: "", schoolEmail: "", address: "", district: "", adminName: "", adminEmail: "", password: "" }));
    } catch (error) {
      setErrorBanner(error instanceof Error ? error.message : "School account could not be created.");
    } finally {
      setProvisioning(false);
    }
  };

  return (
    <div className="space-y-6">

      <div>
        <div className="space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Center
                </Link>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <p className="text-xs text-muted-foreground">
                Manage all accounts with soft deletion (Active, Hidden, Archived, Suspended) and audit logging.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {section === "schools" && <Button type="button" onClick={() => setShowProvisionSchool(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Add School Account
              </Button>}
              <Badge variant="outline" className="text-xs">
                Total Users: {loaded ? users.length : "—"}
              </Badge>
              <Badge variant="success" className="text-xs">
                Active: {loaded ? users.filter((u) => u.status === "ACTIVE").length : "—"}
              </Badge>
            </div>
          </div>

          {/* Success Banner */}
          {successBanner && (
            <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successBanner}</span>
            </div>
          )}
          {errorBanner && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-700 dark:text-red-300">
              {errorBanner}
            </div>
          )}

          {section !== "schools" && <CreateUserForm defaultRole={fixedRole === "ALL" ? "STUDENT" : fixedRole as "STUDENT" | "TEACHER"} onCreated={(user) => setUsers((current) => [user, ...current])} />}
          {/* Filters & Search Toolbar */}
          {section === "schools" && <SchoolDirectory key={users.length} />}
          <Card className="border bg-card p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Search Bar */}
              <div className="sm:col-span-6 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by name, email, or school..."
                  className="pl-9 h-10 text-xs"
                />
              </div>

              {/* Role Filter */}
              <div className="sm:col-span-3">
                <select
                  disabled={fixedRole !== "ALL"}
                  value={fixedRole === "ALL" ? roleFilter : fixedRole}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ALL">Filter by Role (All)</option>
                  {ROLES_LIST.filter((r) => r !== "ALL").map((r) => (
                    <option key={r} value={r}>
                      Role: {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="sm:col-span-3">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ALL">Filter by Status (All)</option>
                  {STATUSES_LIST.filter((s) => s !== "ALL").map((s) => (
                    <option key={s} value={s}>
                      Status: {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Users Table */}
          <Card className="border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                    <th className="p-3.5 pl-6">User / Email</th>
                    <th className="p-3.5">Assigned Role</th>
                    <th className="p-3.5">School / Context</th>
                    <th className="p-3.5">Paid Bundle</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Created</th>
                    <th className="p-3.5 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        {loaded ? "No users found matching your query criteria." : "User records have not loaded."}
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u) => {
                      let statusBadge = <Badge variant="success">Active</Badge>;
                      if (u.status === "SUSPENDED") {
                        statusBadge = <Badge variant="destructive">Suspended</Badge>;
                      } else if (u.status === "ARCHIVED") {
                        statusBadge = <Badge variant="secondary">Archived</Badge>;
                      } else if (u.status === "HIDDEN") {
                        statusBadge = <Badge variant="outline">Hidden</Badge>;
                      }

                      return (
                        <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3.5 pl-6">
                            <div className="font-semibold text-foreground">{u.name}</div>
                            <div className="text-muted-foreground font-mono text-[11px]">{u.email}</div>
                          </td>
                          <td className="p-3.5">
                            <Badge variant="outline" className="font-mono text-[10px]">
                              {u.role}
                            </Badge>
                          </td>
                          <td className="p-3.5 text-muted-foreground">{u.schoolName}</td>
                          <td className="p-3.5">
                            {u.bundleCode ? (
                              <div className="space-y-1">
                                <Badge variant="outline" className="text-[9px]">{u.bundleCode}</Badge>
                                <div className="text-[10px] text-muted-foreground">{u.subscriptionStatus}</div>
                              </div>
                            ) : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="p-3.5">{statusBadge}</td>
                          <td className="p-3.5 text-muted-foreground">{u.createdAt}</td>
                          <td className="p-3.5 pr-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setNewRole(u.role);
                                  setStatusAction("role");
                                }}
                                className="h-8 text-xs px-2 text-primary"
                                title="Change Role"
                              >
                                Role
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setNewStatus(u.status);
                                  setStatusAction("status");
                                }}
                                className="h-8 text-xs px-2"
                                title="Change Status"
                              >
                                Status
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between p-4 border-t text-xs text-muted-foreground">
              <div>
                Showing {filteredUsers.length ? (page - 1) * itemsPerPage + 1 : 0} to{" "}
                {Math.min(page * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="h-8 px-2.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="h-8 px-2.5"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Audit Log Safeguard Notice */}
          <div className="rounded-2xl border bg-card/60 p-5 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <span>Non-Destructive Student Record Policy</span>
            </div>
            <p className="leading-relaxed">
              Keep student records recoverable by using account status controls. 
              Use <strong>ARCHIVED</strong> or <strong>HIDDEN</strong> to safely remove students from active school registers, or <strong>SUSPENDED</strong> to lock system access. 
              All status and role modifications write audit entries.
            </p>
          </div>
        </div>
      </div>


      {showProvisionSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <Card className="my-6 w-full max-w-3xl space-y-5 border bg-card p-6 shadow-2xl">
            <div>
              <CardTitle className="text-lg">Create School Account & Bundle Access</CardTitle>
              <CardDescription className="mt-1 text-xs">
                Creates the school tenant, School Admin login, and enforceable subscription entitlements. ACTIVE means payment was confirmed manually; payment gateways remain sandbox until merchant credentials are configured.
              </CardDescription>
            </div>
            <form onSubmit={handleProvisionSchool} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-semibold">School name<Input value={schoolForm.schoolName} onChange={(event) => setSchoolForm((current) => ({ ...current, schoolName: event.target.value }))} required /></label>
                <label className="space-y-1 text-xs font-semibold">School code<Input value={schoolForm.schoolCode} onChange={(event) => setSchoolForm((current) => ({ ...current, schoolCode: event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") }))} placeholder="SCHOOL_001" required /></label>
                <label className="space-y-1 text-xs font-semibold">School email<Input type="email" value={schoolForm.schoolEmail} onChange={(event) => setSchoolForm((current) => ({ ...current, schoolEmail: event.target.value }))} /></label>
                <label className="space-y-1 text-xs font-semibold">District<Input value={schoolForm.district} onChange={(event) => setSchoolForm((current) => ({ ...current, district: event.target.value }))} /></label>
                <label className="space-y-1 text-xs font-semibold sm:col-span-2">Address<Input value={schoolForm.address} onChange={(event) => setSchoolForm((current) => ({ ...current, address: event.target.value }))} /></label>
              </div>
              <div className="border-t pt-4">
                <div className="mb-2 text-xs font-bold">School Administrator</div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="space-y-1 text-xs font-semibold">Full name<Input value={schoolForm.adminName} onChange={(event) => setSchoolForm((current) => ({ ...current, adminName: event.target.value }))} required /></label>
                  <label className="space-y-1 text-xs font-semibold">Login email<Input type="email" value={schoolForm.adminEmail} onChange={(event) => setSchoolForm((current) => ({ ...current, adminEmail: event.target.value }))} required /></label>
                  <label className="space-y-1 text-xs font-semibold">Temporary password<Input type="password" minLength={10} value={schoolForm.password} onChange={(event) => setSchoolForm((current) => ({ ...current, password: event.target.value }))} required /></label>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="mb-3 text-xs font-bold">Package & payment access</div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="space-y-1 text-xs font-semibold">Bundle
                    <select value={schoolForm.bundleCode} onChange={(event) => setSchoolForm((current) => ({ ...current, bundleCode: event.target.value }))} className="h-10 w-full rounded-xl border bg-background px-3 font-normal">
                      {SCHOOL_BUNDLES.map((bundle) => <option key={bundle.code} value={bundle.code}>{bundle.name}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1 text-xs font-semibold">Billing cycle
                    <select value={schoolForm.billingCycle} onChange={(event) => setSchoolForm((current) => ({ ...current, billingCycle: event.target.value }))} className="h-10 w-full rounded-xl border bg-background px-3 font-normal"><option value="MONTHLY">Monthly</option><option value="ANNUAL">Annual</option></select>
                  </label>
                  <label className="space-y-1 text-xs font-semibold">Access status
                    <select value={schoolForm.subscriptionStatus} onChange={(event) => setSchoolForm((current) => ({ ...current, subscriptionStatus: event.target.value }))} className="h-10 w-full rounded-xl border bg-background px-3 font-normal"><option value="TRIALING">Trial access</option><option value="ACTIVE">Payment confirmed manually</option></select>
                  </label>
                </div>
                {(() => {
                  const bundle = SCHOOL_BUNDLES.find((item) => item.code === schoolForm.bundleCode);
                  if (!bundle) return null;
                  const price = schoolForm.billingCycle === "MONTHLY" ? bundle.monthlyPriceNpr : bundle.annualPriceNpr;
                  return <div className="mt-3 rounded-xl bg-muted/50 p-3 text-xs"><div className="font-semibold">NPR {price.toLocaleString()} / {schoolForm.billingCycle === "MONTHLY" ? "month" : "year"}</div><div className="mt-1 text-muted-foreground">{bundle.description}</div><div className="mt-2">Includes: {bundle.features.join(", ").replaceAll("_", " ")}</div></div>;
                })()}
              </div>
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowProvisionSchool(false)}>Cancel</Button>
                <Button type="submit" disabled={provisioning}>{provisioning ? "Creating..." : "Create school account"}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal Dialog for Status Change */}
      {selectedUser && statusAction === "status" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <Card className="w-full max-w-md border bg-card p-6 space-y-4 shadow-2xl">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold">Change Account Status</CardTitle>
              <CardDescription className="text-xs">
                Updating status for <strong>{selectedUser.name}</strong> ({selectedUser.email})
              </CardDescription>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Select New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as AdminUserItem["status"])}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs"
                >
                  <option value="ACTIVE">ACTIVE — Normal platform access</option>
                  <option value="HIDDEN">HIDDEN — Not visible on active rosters</option>
                  <option value="ARCHIVED">ARCHIVED — Retained for historical transcripts</option>
                  <option value="SUSPENDED">SUSPENDED — Blocked from logging in</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Reason for Audit Log</label>
                <Input
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  placeholder="e.g. Student transferred / Academic leave"
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                Cancel
              </Button>
              <Button variant="nepal" size="sm" onClick={handleUpdateStatus}>
                Confirm Status Change
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Dialog for Role Change */}
      {selectedUser && statusAction === "role" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <Card className="w-full max-w-md border bg-card p-6 space-y-4 shadow-2xl">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold">Assign User Role</CardTitle>
              <CardDescription className="text-xs">
                Modifying role permissions for <strong>{selectedUser.name}</strong>
              </CardDescription>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Select Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AdminUserItem["role"])}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs"
                >
                  {ROLES_LIST.filter((r) => r !== "ALL").map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                Cancel
              </Button>
              <Button variant="nepal" size="sm" onClick={handleUpdateRole}>
                Assign Role
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
