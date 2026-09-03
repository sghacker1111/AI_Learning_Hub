import { requireRole } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["TEACHER"]);
  return <WorkspaceShell user={{ ...user, role: "TEACHER" }}>{children}</WorkspaceShell>;
}
