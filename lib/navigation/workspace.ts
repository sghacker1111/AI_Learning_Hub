export type WorkspaceRole = "STUDENT" | "TEACHER" | "SUPER_ADMIN" | "SCHOOL_ADMIN";

export function workspaceNavigation(role: WorkspaceRole) {
  if (role === "SCHOOL_ADMIN") return [
    { label: "Dashboard", href: "/school", icon: "dashboard" },
    { label: "Students", href: "/school/students", icon: "student" },
    { label: "Teachers", href: "/school/teachers", icon: "teacher" },
    { label: "Curriculum", href: "/school/content", icon: "learning" },
  ];
  if (role === "SUPER_ADMIN") return [
    { label: "Login Users", href: "/admin/users", icon: "users" },
    { label: "Students", href: "/admin/students", icon: "student" },
    { label: "Teachers", href: "/admin/teachers", icon: "teacher" },
    { label: "School", href: "/admin/schools", icon: "school" },
    { label: "Add MCQs", href: "/admin/mcqs", icon: "checks" },
    { label: "Add Questions", href: "/admin/questions", icon: "question" },
    { label: "Add Exam Questions", href: "/admin/exam-questions", icon: "exam" },
    { label: "Add Specification Grid", href: "/admin/specification-grids", icon: "grid" },
  ];
  const root = role === "TEACHER" ? "/teacher" : "/student";
  return [
    { label: "Dashboard", href: role === "TEACHER" ? root : `${root}/dashboard`, icon: "dashboard" },
    { label: "My Learning", href: `${root}/learning`, icon: "learning" },
    { label: "Guru AI", href: `${root}/guru-ai`, icon: "guru" },
    { label: "Exams", href: `${root}/exams`, icon: "exam" },
  ];
}

// Retain old bookmarks without exposing retired prototype screens.
export function retiredWorkspaceDestination(path: string): string | null {
  if (path.startsWith("/school") && !workspaceNavigation("SCHOOL_ADMIN").some((item) => item.href === path)) return "/school";
  const student = workspaceNavigation("STUDENT").map((item) => item.href);
  if (path.startsWith("/student") && !student.includes(path)) {
    if (/progress|learning|quests/.test(path)) return "/student/learning";
    if (/tutor|voice|subject|practice|scanner|glossary/.test(path)) return "/student/guru-ai";
    return "/student/dashboard";
  }
  const teacher = workspaceNavigation("TEACHER").map((item) => item.href);
  if (path.startsWith("/teacher") && !teacher.includes(path)) {
    if (path.includes("exam")) return "/teacher/exams";
    if (/tutor|lesson/.test(path)) return "/teacher/guru-ai";
    return "/teacher/learning";
  }
  const admin = workspaceNavigation("SUPER_ADMIN").map((item) => item.href);
  if (path.startsWith("/admin") && path !== "/admin/login" && !admin.includes(path)) {
    return path.includes("curriculum") ? "/admin/questions" : "/admin/users";
  }
  return null;
}
