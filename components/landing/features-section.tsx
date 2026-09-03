import {
  Bot,
  BookCheck,
  BrainCircuit,
  LineChart,
  GraduationCap,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    id: "ai-tutor",
    badge: "Configured Local Provider",
    title: "AI Personal Tutor",
    titleNepali: "व्यक्तिगत एआई शिक्षक",
    description:
      "A student and teacher tutoring interface that uses the configured local Ollama model for direct, checked, plain-text answers.",
    icon: Bot,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/40",
    bullets: [
      "Direct answers followed by essential explanation and verification",
      "Rule-based math solvers with explicit verification status",
      "Interactive two-set Venn and fluid-force demonstrations",
      "Reference metadata shown for retrieved sample chunks",
    ],
  },
  {
    id: "curriculum",
    badge: "Structured Sample Content",
    title: "Curriculum Data Model",
    titleNepali: "पाठ्यक्रम विकास केन्द्र पाठहरू",
    description:
      "The prototype demonstrates a structured grade-to-lesson content model with a small Class 8 sample dataset that must be editorially verified before production use.",
    icon: BookCheck,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40",
    bullets: [
      "Hierarchical: Grade → Subject → Unit → Chapter → Lesson",
      "Specific Learning Outcomes tracked for each topic",
      "Full LaTeX mathematical typesetting via KaTeX",
      "Bilingual support in English and शुद्ध नेपाली",
    ],
  },
  {
    id: "practice",
    badge: "Sample Assessment",
    title: "Practice & Adaptive Quizzes",
    titleNepali: "अभ्यास र अनुकूलित प्रश्नोत्तर",
    description:
      "A small Class 8 question set demonstrates MCQs, numerical practice, cognitive levels, and explicit explanations.",
    icon: BrainCircuit,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/40",
    bullets: [
      "Rule-based difficulty progression in the sample flow",
      "Cognitive levels: Knowledge, Understanding, Application, Higher Ability",
      "Database mastery writes only for authoritative stored questions",
      "16-mark Class 8 practice mini-paper demonstration",
    ],
  },
  {
    id: "progress",
    badge: "Analytics Preview",
    title: "Mastery Progress Tracking",
    titleNepali: "सिकाइ प्रगति र विश्लेषण",
    description:
      "Seeded mastery profiles demonstrate how diagnostic views and recommendations could be presented; they are not live analytics by default.",
    icon: LineChart,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40",
    bullets: [
      "Unit & Chapter mastery breakdown radar",
      "Sample study-time and streak displays",
      "Targeted revision suggestions for weak topics",
      "Parent progress interface using demonstration records",
    ],
  },
  {
    id: "teachers",
    badge: "Teacher Preview",
    title: "Teacher Assistant Tools",
    titleNepali: "शिक्षक सहायता उपकरणहरू",
    description:
      "Deterministic templates preview lesson plans, assignments, analytics, and a Class 8 practice-paper workflow for teacher review.",
    icon: GraduationCap,
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40",
    bullets: [
      "Four-group Class 8 practice-paper generator",
      "Sample answer-key and marking-rubric display",
      "Classroom mastery overview identifying struggling students",
      "Database-backed lesson status workflow when PostgreSQL is available",
    ],
  },
  {
    id: "schools",
    badge: "Institutional Infrastructure",
    title: "Multi-Tenant School Platform",
    titleNepali: "विद्यालय व्यवस्थापन प्रणाली",
    description:
      "A school-management prototype for academic years, classes, sections, teacher allocations, and student rosters. Production tenant isolation still requires end-to-end database enforcement.",
    icon: Building2,
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/40",
    bullets: [
      "Role and route authorization foundation",
      "Account deactivation instead of destructive user deletion",
      "IEMIS-format validation preview without ministry sync",
      "Role-Based Access Control (Super Admin, School Admin, Teacher, Student, Parent)",
    ],
  },
];

export function FeaturesSection() {
  return (
    <section id="subjects" className="py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <Badge variant="subtle" className="px-3 py-1 text-xs font-semibold">
            {"Built Specifically for Nepal's Education Ecosystem"}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Explore the Implemented Prototype Modules
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            From structured curriculum records and deterministic retrieval samples to teacher tools and parent dashboards, explore the implemented prototype.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.id}
                id={feature.id}
                className="flex flex-col justify-between border bg-card/60 transition-all hover:border-primary/40 hover:shadow-lg"
              >
                <CardHeader className="space-y-3 p-6">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${feature.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {feature.badge}
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                    <p className="text-xs text-muted-foreground font-devanagari mt-0.5">
                      {feature.titleNepali}
                    </p>
                  </div>
                  <CardDescription className="text-xs sm:text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 pt-0 space-y-4">
                  <ul className="space-y-2">
                    {feature.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
