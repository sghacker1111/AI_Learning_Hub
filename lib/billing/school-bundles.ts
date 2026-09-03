export type SchoolFeature =
  | "AI_TUTOR"
  | "QUESTION_BANK"
  | "EXAM_GENERATOR"
  | "CURRICULUM_AUTHORING"
  | "ANALYTICS"
  | "SCHOOL_MANAGEMENT";

export type SchoolBundleCodeValue =
  | "FULL_SCHOOL_AI"
  | "AI_TUTOR_ONLY"
  | "EXAM_GENERATOR_ONLY"
  | "ASSESSMENT_SUITE"
  | "CORE_SCHOOL_PLATFORM";

export type SchoolBundle = {
  code: SchoolBundleCodeValue;
  name: string;
  description: string;
  monthlyPriceNpr: number;
  annualPriceNpr: number;
  features: SchoolFeature[];
};

export const SCHOOL_BUNDLES: SchoolBundle[] = [
  {
    code: "FULL_SCHOOL_AI",
    name: "Full School AI Bundle",
    description: "Complete school platform, AI Tutor, curriculum authoring, question bank, exams, and analytics.",
    monthlyPriceNpr: 9999,
    annualPriceNpr: 99999,
    features: ["AI_TUTOR", "QUESTION_BANK", "EXAM_GENERATOR", "CURRICULUM_AUTHORING", "ANALYTICS", "SCHOOL_MANAGEMENT"],
  },
  {
    code: "AI_TUTOR_ONLY",
    name: "AI Tutor Bundle Only",
    description: "Hosted AI Tutor access for the school’s students and teachers.",
    monthlyPriceNpr: 3999,
    annualPriceNpr: 39999,
    features: ["AI_TUTOR"],
  },
  {
    code: "EXAM_GENERATOR_ONLY",
    name: "Exam Questions Generator Only",
    description: "Question bank and exam paper generation without AI Tutor access.",
    monthlyPriceNpr: 2999,
    annualPriceNpr: 29999,
    features: ["QUESTION_BANK", "EXAM_GENERATOR"],
  },
  {
    code: "ASSESSMENT_SUITE",
    name: "Assessment & Analytics Suite",
    description: "Question bank, exam generation, and school assessment analytics.",
    monthlyPriceNpr: 4999,
    annualPriceNpr: 49999,
    features: ["QUESTION_BANK", "EXAM_GENERATOR", "ANALYTICS"],
  },
  {
    code: "CORE_SCHOOL_PLATFORM",
    name: "Core School Platform",
    description: "School management and curriculum tools without generative AI.",
    monthlyPriceNpr: 1999,
    annualPriceNpr: 19999,
    features: ["CURRICULUM_AUTHORING", "SCHOOL_MANAGEMENT"],
  },
];

export function getSchoolBundle(code: string | null | undefined) {
  return SCHOOL_BUNDLES.find((bundle) => bundle.code === code);
}

export function bundleHasFeature(code: string | null | undefined, feature: SchoolFeature) {
  return getSchoolBundle(code)?.features.includes(feature) ?? false;
}
