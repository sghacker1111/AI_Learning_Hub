import { requireRole } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
export default async function SchoolLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["SCHOOL_ADMIN"]);
  return <WorkspaceShell user={{ userId: user.userId, name: user.name, role: "SCHOOL_ADMIN" }}>{children}</WorkspaceShell>;
}
