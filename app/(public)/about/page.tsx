import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Heart, Sparkles, BookOpen, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-16">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="subtle" className="px-3 py-1 text-xs font-semibold">
              About AI Learning Nepal
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
              Building a Transparent Learning Prototype for Nepal
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              This repository explores AI tutoring, rule-based STEM solvers, practice, and school workflows around a small Class 8 sample. It is not an official CDC product or a complete curriculum service.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border p-6 space-y-3 bg-card/60">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
                <Heart className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold">Our Educational Mission</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our long-term goal is to make patient, culturally appropriate learning support available in English and Nepali. The current build is a development prototype, not a continuously available public service.
              </p>
            </Card>

            <Card className="border p-6 space-y-3 bg-card/60">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold">Content Boundary</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The prototype is designed to ground answers in reviewed curriculum material. Its bundled dataset is currently a small Class 8 sample and is not a complete or officially certified CDC corpus.
              </p>
            </Card>
          </div>

          {/* Core Architectural Pillars */}
          <div className="space-y-6 pt-6">
            <h2 className="text-2xl font-bold text-center sm:text-3xl">Architectural Pillars</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border bg-muted/20 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base">Retrieval-Augmented Generation</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A separate retrieval demonstration ranks five bundled Class 8 chunks by metadata and deterministic similarity. The tutor chat is not yet guaranteed to use those results.
                </p>
              </div>

              <div className="p-6 rounded-2xl border bg-muted/20 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base">Mathematical Verification</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Supported calculations use deterministic TypeScript solvers, and unsupported steps are explicitly reported as unverified.
                </p>
              </div>

              <div className="p-6 rounded-2xl border bg-muted/20 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base">Role-Based Ecosystem</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Signed sessions and route-level role checks cover admin, curriculum, school, teacher, student, and parent areas. Production tenant isolation still needs end-to-end database enforcement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
