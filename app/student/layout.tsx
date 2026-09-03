import { requireRole } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["STUDENT"]);
  return <WorkspaceShell user={{ ...user, role: "STUDENT" }}>{children}</WorkspaceShell>;
}
