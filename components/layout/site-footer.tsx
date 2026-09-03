import Link from "next/link";
import { GraduationCap, Heart, ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-blue-700 text-white shadow-sm">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">AI Learning Nepal</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Educational platform prototype with a Nursery-to-Class-12 catalog, a small Class 8 sample, and demonstration tools for students, teachers, and schools.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Unofficial sample • editorial verification required</span>
            </div>
          </div>

          {/* Platform Col */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/#ai-tutor" className="hover:text-foreground transition-colors">
                  AI Personal Tutor
                </Link>
              </li>
              <li>
                <Link href="/#practice" className="hover:text-foreground transition-colors">
                  Adaptive Practice
                </Link>
              </li>
              <li>
                <Link href="/student/practice/stem-lab" className="hover:text-foreground transition-colors">
                  Interactive Whiteboard
                </Link>
              </li>
              <li>
                <Link href="/student/tutor" className="hover:text-foreground transition-colors">
                  Voice Interface Demo
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Learning Col */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Learning</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/#classes" className="hover:text-foreground transition-colors">
                  Basic Level (Nursery-Class 8)
                </Link>
              </li>
              <li>
                <Link href="/#classes" className="hover:text-foreground transition-colors">
                  Secondary Level (Class 9-12)
                </Link>
              </li>
            </ul>
          </div>

          {/* Teachers & Schools */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Teachers & Schools</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  Teacher Assistant
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  Exam Paper Generator
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  School Admin Portal
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  Parent Link Dashboard
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  Multi-Tenant School Cloud
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} AI Learning Nepal. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 inline" />
            <span>for Students & Educators across Nepal</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:underline">
                  About & Prototype Notes
            </Link>
            <Link href="/accessibility" className="hover:underline">
              Accessibility Status
            </Link>
            <Link href="/pricing" className="hover:underline">
              Pricing Preview
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
