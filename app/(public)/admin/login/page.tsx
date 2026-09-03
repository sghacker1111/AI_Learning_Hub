"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isDevelopment, setIsDevelopment] = React.useState(false);
  React.useEffect(() => { fetch("/api/auth/login").then((response) => response.json()).then((data) => setIsDevelopment(data.demoAuthEnabled === true)).catch(() => {}); }, []);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleAdminPersona = (presetEmail: string) => {
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
        setErrorMessage(data.error || "Authentication failed. Unauthorized administrator credentials.");
        setLoading(false);
        return;
      }

      if (data.user?.role !== "SUPER_ADMIN") {
        setErrorMessage("This account is not authorized for the administrative portal.");
        setLoading(false);
        return;
      }

      // Route directly to admin dashboard
      router.push("/admin");
      router.refresh();
    } catch {
      setErrorMessage("Network error during administrative authentication.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Government / High-Security Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            <ShieldAlert className="h-4 w-4" />
            <span>Restricted Access • National Administration</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrative Control Center
          </h1>
          <p className="text-xs text-slate-400">
            Nepal CDC Curriculum Governance, IEMIS Institutional Roster & System Infrastructure
          </p>
        </div>

        {/* High Security Login Card */}
        <Card className="border border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl text-slate-100">
          <CardHeader className="space-y-1 border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Lock className="h-4 w-4 text-red-500" />
                <span>Admin Authentication</span>
              </CardTitle>
              <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400">
                Secure Session
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Enter authorized administrative credentials to access governance portals.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-4">
              {errorMessage && (
                <div className="rounded-xl bg-red-500/15 border border-red-500/30 p-3 text-xs text-red-300 flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Administrator Official Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ailearning.np"
                    className="pl-10 bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-red-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Master Key / Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Quick Admin Seed Switcher */}
              {isDevelopment && <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-medium text-slate-400">Select Authorized Role Persona:</span>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleAdminPersona("admin@ailearning.np")}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      email === "admin@ailearning.np"
                        ? "border-red-500 bg-red-500/10 text-red-300 font-semibold"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <div className="font-bold">Super Admin</div>
                    <div className="text-[10px] opacity-80">Full Platform Control</div>
                  </button>

                </div>
              </div>}
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-2 border-t border-slate-800">
              <Button
                type="submit"
                variant="nepal"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-10 shadow-lg shadow-red-900/30"
                disabled={loading}
              >
                {loading ? "Authenticating Session..." : "Authorize Administrative Session"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <div className="text-center text-xs text-slate-500 pt-1">
                Use an authorized administrative account. Access is enforced by role.
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← Return to Public Learning Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
