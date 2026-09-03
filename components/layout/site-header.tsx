"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Menu, X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserNavProfile } from "@/components/layout/user-nav-profile";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#classes", label: "Classes" },
  { href: "/#subjects", label: "Subjects" },
  { href: "/#ai-tutor", label: "AI Tutor" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-blue-700 text-white shadow-md shadow-red-500/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight">AI Learning Nepal</span>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] px-1.5 py-0 border-red-500/30 text-red-600 dark:text-red-400">
                Prototype
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground -mt-1">
              Unofficial Class 8 sample
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-primary hover:bg-accent/50",
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Controls */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          
          {/* User Profile & Auth Trigger */}
          <UserNavProfile />

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b bg-background px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t flex flex-col gap-2">
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center">
                Login
              </Button>
            </Link>
            <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="nepal" className="w-full justify-center">
                Create Demo Account
              </Button>
            </Link>
            <Link href="/student/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="secondary" className="w-full justify-center gap-2">
                <BookOpen className="h-4 w-4" />
                Open Student Dashboard
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
