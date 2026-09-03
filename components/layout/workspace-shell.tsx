"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Bot, CheckSquare, ClipboardList, GraduationCap, Grid2X2, HelpCircle, LayoutDashboard, LogOut, Menu, School, ShieldCheck, Users } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { workspaceNavigation, type WorkspaceRole } from "@/lib/navigation/workspace";
import { LearningProvider } from "@/components/learning/learning-provider";
import { cn } from "@/lib/utils";

const icons = { dashboard: LayoutDashboard, learning: BookOpen, guru: Bot, exam: ClipboardList, users: Users, student: GraduationCap, teacher: Users, school: School, checks: CheckSquare, question: HelpCircle, grid: Grid2X2 };

export function WorkspaceShell({ children, user }: { children: React.ReactNode; user: { userId: string; schoolId?: string | null; name: string; role: WorkspaceRole } }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [logoutError, setLogoutError] = React.useState("");
  const navigation = workspaceNavigation(user.role);
  const active = navigation.find((item) => pathname === item.href);
  const admin = user.role === "SUPER_ADMIN";
  const manager = admin || user.role === "SCHOOL_ADMIN";
  async function logout() {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      window.location.assign(admin ? "/admin/login" : "/login");
    } catch { setLogoutError("Could not sign out. Please try again."); }
  }
  const sidebar = <>
    <Link href={navigation[0].href} onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-6 text-xl font-extrabold tracking-tight"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white">{admin ? <ShieldCheck /> : <Bot />}</span>Guru AI<span className="sr-only">home</span></Link>
    <p className="px-4 pb-4 text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">{admin ? "Administration" : user.role === "TEACHER" ? "Teacher workspace" : "Student workspace"}</p>
    <nav aria-label="Main navigation" className="flex-1 space-y-2 overflow-y-auto px-2">
      {navigation.map((item) => { const Icon = icons[item.icon as keyof typeof icons]; return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={pathname === item.href ? "page" : undefined} className={cn("flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted", pathname === item.href && "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 dark:bg-indigo-950 dark:text-indigo-200 dark:ring-indigo-900")}><Icon className="h-5 w-5 shrink-0" />{item.label}</Link>; })}
    </nav>
    <div className="m-3 rounded-2xl border bg-muted/30 p-4"><p className="truncate font-semibold">{user.name}</p><p className="mt-1 text-xs text-muted-foreground">{admin ? "Super Admin · management only" : "Your personal learning space"}</p><button onClick={logout} className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><LogOut className="h-4 w-4" />Sign out</button>{logoutError && <p role="alert" className="mt-2 text-xs text-destructive">{logoutError}</p>}</div>
  </>;
  const body = <div className="workspace min-h-screen bg-slate-50/70 dark:bg-background">
    <a href="#workspace-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-background focus:p-4">Skip to content</a>
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-background lg:flex print:hidden">{sidebar}</aside>
    <Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 lg:hidden" /><Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(85vw,280px)] flex-col bg-background shadow-xl lg:hidden"><Dialog.Title className="sr-only">Workspace navigation</Dialog.Title><Dialog.Description className="sr-only">Choose a section of your workspace.</Dialog.Description>{sidebar}<Dialog.Close className="m-3 rounded-xl border p-3 text-sm">Close menu</Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>
    <div className="min-w-0 lg:pl-64 print:pl-0">
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur sm:px-8 print:hidden"><div className="flex items-center gap-3"><button onClick={() => setOpen(true)} aria-label="Open navigation" className="rounded-xl border p-2 lg:hidden"><Menu /></button><div><p className="text-xs font-medium text-muted-foreground">{admin ? "Manage your learning platform" : "A little progress, every day"}</p><p className="font-bold">{active?.label || "Workspace"}</p></div></div><div className="flex items-center gap-3"><span className="hidden text-sm text-muted-foreground sm:inline">{user.name}</span><ThemeToggle /></div></header>
      <main id="workspace-content" className="mx-auto min-w-0 max-w-[1680px] p-4 sm:p-6 xl:p-8">{children}</main>
    </div>
  </div>;
  return manager ? body : <LearningProvider key={JSON.stringify([user.userId, user.schoolId])} userId={user.userId} schoolId={user.schoolId} role={user.role === "TEACHER" ? "TEACHER" : "STUDENT"}>{body}</LearningProvider>;
}
