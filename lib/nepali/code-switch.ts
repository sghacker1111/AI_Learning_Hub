import { CodeSwitchAnalysis, LanguageRegister } from "./types";
import { CDC_BILINGUAL_GLOSSARY } from "./glossary";

const ROMANIZED_MARKERS = [
  "namaste",
  "bhaneko",
  "kasari",
  "kina",
  "chaina",
  "cha",
  "garne",
  "sikne",
  "padhne",
  "maile",
  "hamro",
  "kasto",
  "bata",
  "ko",
  "le",
  "lai",
  "bujhe",
  "bujhina",
  "dhanyabad",
  "ani",
];

export function analyzeCodeSwitching(text: string): CodeSwitchAnalysis {
  if (!text || !text.trim()) {
    return {
      register: "PURE_ENGLISH",
      nepaliCharRatio: 0,
      englishCharRatio: 1,
      containsDevanagari: false,
      containsRomanizedKeywords: false,
      recommendedSocraticLanguage: "en",
      annotatedGlossaryTerms: [],
    };
  }

  const clean = text.trim();
  let devanagariCount = 0;
  let latinCount = 0;

  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    // Devanagari Unicode Block: 0x0900 to 0x097F
    if (code >= 0x0900 && code <= 0x097f) {
      devanagariCount++;
    } else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      latinCount++;
    }
  }

  const totalChars = devanagariCount + latinCount;
  const nepaliCharRatio = totalChars > 0 ? devanagariCount / totalChars : 0;
  const englishCharRatio = totalChars > 0 ? latinCount / totalChars : 0;

  const lowerText = clean.toLowerCase();
  const matchedRomanizedWords = ROMANIZED_MARKERS.filter((word) =>
    new RegExp(`\\b${word}\\b`, "i").test(lowerText)
  );
  const containsRomanizedKeywords = matchedRomanizedWords.length > 0;

  let register: LanguageRegister = "PURE_ENGLISH";
  let recommendedSocraticLanguage: "en" | "ne" | "bilingual" = "en";

  if (nepaliCharRatio > 0.8) {
    register = "PURE_NEPALI";
    recommendedSocraticLanguage = "ne";
  } else if (nepaliCharRatio > 0.15 && englishCharRatio > 0.15) {
    register = "CODE_SWITCHED_NEPGLISH";
    recommendedSocraticLanguage = "bilingual";
  } else if (containsRomanizedKeywords && latinCount > 0) {
    register = "ROMANIZED_NEPALI";
    recommendedSocraticLanguage = "bilingual";
  } else {
    register = "PURE_ENGLISH";
    recommendedSocraticLanguage = "bilingual"; // Bilingual by default to expose CDC terminology
  }

  // Annotate with any matched curriculum glossary terms
  const annotatedGlossaryTerms = CDC_BILINGUAL_GLOSSARY.filter((t) => {
    return (
      lowerText.includes(t.english.toLowerCase()) ||
      lowerText.includes(t.nepali) ||
      lowerText.includes(t.romanized.toLowerCase())
    );
  });

  return {
    register,
    nepaliCharRatio,
    englishCharRatio,
    containsDevanagari: devanagariCount > 0,
    containsRomanizedKeywords,
    recommendedSocraticLanguage,
    annotatedGlossaryTerms,
  };
}
