"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowRight, Lock, Mail, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CDC_GRADES } from "@/lib/constants/curriculum";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [selectedGrade, setSelectedGrade] = React.useState("class-8");
  const [userType, setUserType] = React.useState<"STUDENT" | "PARENT">("STUDENT");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role: userType,
          gradeId: selectedGrade,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      router.push(data.redirectUrl || "/dashboard");
    } catch {
      setErrorMessage("An unexpected error occurred during registration.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-blue-700 text-white shadow-md">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight">AI Learning Nepal</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Start your personalized CDC curriculum journey
          </p>
        </div>

        {/* Register Card */}
        <Card className="border bg-card/80 backdrop-blur shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold">Create an Account</CardTitle>
            <CardDescription className="text-xs">
              Select your role and enter your details to get started
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

              {/* Account Type Tabs */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(["STUDENT", "PARENT"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUserType(type)}
                    className={`py-2 rounded-lg border text-center font-medium transition-all ${
                      userType === type
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {type === "STUDENT" ? "Student" : "Parent"}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aayush Sharma"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aayush@example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password (min. 8 characters)"
                    minLength={8}
                    className="pl-10"
                  />
                </div>
              </div>

              {userType === "STUDENT" && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Select Current Class</label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {CDC_GRADES.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.nameNepali}) — {g.levelLabel}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
              <Button type="submit" variant="nepal" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Sign in
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
