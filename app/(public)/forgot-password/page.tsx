"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-blue-700 text-white shadow-md">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight">AI Learning Nepal</span>
          </Link>
          <p className="text-sm text-muted-foreground">Reset your account password</p>
        </div>

        <Card className="border bg-card/80 backdrop-blur shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold">Forgot Password</CardTitle>
            <CardDescription className="text-xs">
              Email delivery and password-reset tokens are not configured in this prototype.
            </CardDescription>
          </CardHeader>

          {submitted ? (
            <CardContent className="space-y-4 text-center py-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold">Recovery Service Not Configured</p>
              <p className="text-xs text-muted-foreground">
                No email was sent. Contact an authorized administrator to recover access until a secure reset-token workflow is implemented.
              </p>
              <Link href="/login" className="inline-block pt-2">
                <Button variant="outline" size="sm">
                  Back to Sign In
                </Button>
              </Link>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-3">
                <Button type="submit" variant="nepal" className="w-full">
                  Check Recovery Availability
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <div className="text-center text-xs text-muted-foreground">
                  Remember your password?{" "}
                  <Link href="/login" className="font-semibold text-primary hover:underline">
                    Back to Sign in
                  </Link>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
