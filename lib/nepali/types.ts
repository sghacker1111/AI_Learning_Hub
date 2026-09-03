export type LanguageRegister =
  | "PURE_ENGLISH"
  | "PURE_NEPALI"
  | "ROMANIZED_NEPALI"
  | "CODE_SWITCHED_NEPGLISH";

export interface TransliterationResult {
  originalText: string;
  devanagariText: string;
  detectedRegister: LanguageRegister;
  wordCount: number;
}

export interface GlossaryTerm {
  id: string;
  english: string;
  nepali: string;
  romanized: string;
  subject: "Mathematics" | "Science" | "Social Studies" | "General";
  gradeLevel: string; // e.g. "Class 8" or "Class 1-12"
  definitionEnglish: string;
  definitionNepali: string;
  formulaOrSymbol?: string;
  exampleEnglish?: string;
  exampleNepali?: string;
}

export interface CodeSwitchAnalysis {
  register: LanguageRegister;
  nepaliCharRatio: number;
  englishCharRatio: number;
  containsDevanagari: boolean;
  containsRomanizedKeywords: boolean;
  recommendedSocraticLanguage: "en" | "ne" | "bilingual";
  annotatedGlossaryTerms: GlossaryTerm[];
}
