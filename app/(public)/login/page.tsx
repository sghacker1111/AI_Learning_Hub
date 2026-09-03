"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [isDevelopment, setIsDevelopment] = React.useState(false);
  React.useEffect(() => { fetch("/api/auth/login").then((response) => response.json()).then((data) => setIsDevelopment(data.demoAuthEnabled === true)).catch(() => {}); }, []);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleRolePersonaPick = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword("password123");
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Login failed. Please verify your credentials.");
        setLoading(false);
        return;
      }

      // Success -> navigate to role destination
      router.push(data.redirectUrl || "/dashboard");
    } catch {
      setErrorMessage("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-blue-700 text-white shadow-md">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight">AI Learning Nepal</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Sign in to access your CDC-aligned personalized AI learning
          </p>
        </div>

        {/* Login Card */}
        <Card className="border bg-card/80 backdrop-blur shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-xs">
              Enter your credentials to continue your study sessions
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="rounded-xl bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@school.edu.np"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Password</label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Demo Quick Persona Switcher */}
              {isDevelopment && <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Quick Seed Persona (Click to autofill):
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleRolePersonaPick("student@demo.np")}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      email === "student@demo.np"
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRolePersonaPick("teacher@demo.np")}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      email === "teacher@demo.np"
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Teacher
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRolePersonaPick("parent@demo.np")}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      email === "parent@demo.np"
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Parent
                  </button>
                </div>
              </div>}
            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
              <Button type="submit" variant="nepal" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                {"Don't have an account? "}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                  Create one free
                </Link>
              </div>

              <div className="pt-2 border-t text-center text-[11px] text-muted-foreground">
                Institutional / System Administrator?{" "}
                <Link href="/admin/login" className="font-semibold text-red-600 dark:text-red-400 hover:underline">
                  Admin Sign In →
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
