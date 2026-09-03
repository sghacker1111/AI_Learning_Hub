import { UserRole } from "@/types";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId?: string;
}

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    SUPER_ADMIN: 100,
    CURRICULUM_ADMIN: 80,
    SCHOOL_ADMIN: 60,
    CONTENT_REVIEWER: 50,
    CONTENT_CREATOR: 40,
    TEACHER: 30,
    STUDENT: 10,
    PARENT: 10,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
