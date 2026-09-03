"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  Shield,
  GraduationCap,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role:
    | "SUPER_ADMIN"
    | "SCHOOL_ADMIN"
    | "TEACHER"
    | "STUDENT"
    | "PARENT";
  status: string;
  preferredLanguage?: string;
}

export function UserNavProfile({ className }: { className?: string }) {
  const router = useRouter();
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    fetch("/api/auth/me", { signal: controller.signal })
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!controller.signal.aborted) {
          setUser(data?.authenticated && data.user ? data.user : null);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setUser(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  // Handle outside click to close dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      setUser(null);
      setIsOpen(false);
      if (user?.role === "SUPER_ADMIN") {
        router.push("/admin/login");
      } else {
        router.push("/login");
      }
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className={`h-9 w-9 rounded-full bg-muted/40 animate-pulse ${className || ""}`} />
    );
  }

  if (!user) {
    return (
      <div className={`flex items-center gap-2 ${className || ""}`}>
        <Link href="/login">
          <Button variant="ghost" size="sm" className="font-medium text-xs">
            Login
          </Button>
        </Link>
        <Link href="/register">
          <Button variant="nepal" size="sm" className="gap-1.5 font-medium text-xs shadow-sm">
            Get Started
          </Button>
        </Link>
      </div>
    );
  }

  // Generate initials
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Role badge color & label
  const getRoleInfo = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return { label: "Super Admin", color: "bg-red-500/15 text-red-600 border-red-500/30", url: "/admin" };
      case "SCHOOL_ADMIN":
        return { label: "School Admin", color: "bg-purple-500/15 text-purple-600 border-purple-500/30", url: "/school" };
      case "TEACHER":
        return { label: "Teacher", color: "bg-blue-500/15 text-blue-600 border-blue-500/30", url: "/teacher" };
      case "PARENT":
        return { label: "Parent", color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", url: "/parent" };
      default:
        return { label: "Class 8 Scholar", color: "bg-primary/10 text-primary border-primary/20", url: "/student/dashboard" };
    }
  };

  const roleInfo = getRoleInfo(user.role);

  return (
    <div className={`relative ${className || ""}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 rounded-full hover:bg-accent/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
        aria-label="User profile menu"
      >
        <Avatar className="h-9 w-9 border-2 border-primary/30 shadow-sm">
          <AvatarFallback className="bg-gradient-to-br from-red-600 to-blue-700 text-white font-bold text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-bold leading-tight truncate max-w-[120px]">{user.name}</span>
          <span className="text-[10px] text-muted-foreground font-medium">{roleInfo.label}</span>
        </div>

        <ChevronDown className="hidden md:block h-3.5 w-3.5 text-muted-foreground transition-transform duration-200" />
      </button>

      {/* Profile Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border bg-card/95 backdrop-blur-md shadow-2xl p-2 z-50 animate-in fade-in-50 zoom-in-95">
          {/* User info header */}
          <div className="p-3 border-b space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground truncate max-w-[140px]">{user.name}</span>
              <Badge variant="outline" className={`text-[9px] px-1.5 py-0 font-semibold ${roleInfo.color}`}>
                {roleInfo.label}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
          </div>

          {/* Nav links */}
          <div className="py-1 space-y-0.5 text-xs">
            <Link
              href={roleInfo.url}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-medium"
            >
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>My Workspace / Dashboard</span>
            </Link>

            {user.role === "STUDENT" && (
              <Link
                href="/student/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-medium"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Profile Settings</span>
              </Link>
            )}

            {user.role === "SUPER_ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-medium"
              >
                <Shield className="h-4 w-4 text-red-600" />
                <span>Admin Governance Suite</span>
              </Link>
            )}

            <Link
              href="/accessibility"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-medium"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Accessibility Preferences</span>
            </Link>
          </div>

          {/* Logout Section */}
          <div className="pt-1 border-t">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4 text-destructive" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
