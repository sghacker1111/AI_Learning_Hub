import { AdminUsersPanel } from "@/components/admin/admin-users-panel";
import { TeacherAssignments } from "@/components/admin/teacher-assignments";
export default function Page() { return <div className="space-y-6"><AdminUsersPanel section="teachers" /><TeacherAssignments /></div>; }
