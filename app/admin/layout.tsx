import { requireRole } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["SUPER_ADMIN"]);
  return <WorkspaceShell user={{ ...user, role: "SUPER_ADMIN" }}>{children}</WorkspaceShell>;
}
