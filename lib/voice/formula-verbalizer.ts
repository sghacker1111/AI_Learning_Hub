import { VocalizedFormula } from "./types";

export const PRESET_VOCALIZED_FORMULAS: Record<string, VocalizedFormula> = {
  sets: {
    latex: "n(A \\cup B) = n(A) + n(B) - n(A \\cap B)",
    spokenNepali:
      "एन अफ ए युनियन बी बराबर एन अफ ए जोड एन अफ बी घटाउ एन अफ ए इन्टरसेक्सन बी",
    spokenEnglish:
      "n of A union B equals n of A plus n of B minus n of A intersection B",
  },
  sp: {
    latex: "\\text{SP} = \\text{MP} - \\text{Discount}",
    spokenNepali: "सेलिङ प्राइस बराबर मार्क प्राइस माइनस डिस्काउन्ट",
    spokenEnglish: "Selling price equals marked price minus discount",
  },
  vat: {
    latex: "\\text{VAT} = \\text{SP} \\times 0.13",
    spokenNepali:
      "भ्याट रकम बराबर सेलिङ प्राइस गुणा शुन्य दशमलव एक तीन वा तेह्र प्रतिशत",
    spokenEnglish: "VAT amount equals selling price multiplied by zero point one three",
  },
  pressure: {
    latex: "P = h \\cdot d \\cdot g",
    spokenNepali:
      "तरल चाप पी बराबर उचाइ एच गुणा घनत्व डी गुणा गुरुत्व प्रवेग जी",
    spokenEnglish:
      "Liquid pressure P equals height h times density d times gravitational acceleration g",
  },
  upthrust: {
    latex: "U = V \\cdot d \\cdot g",
    spokenNepali:
      "ऊर्ध्वचाप यु बराबर विस्थापित आयतन भी गुणा तरल घनत्व डी गुणा जी",
    spokenEnglish:
      "Upthrust U equals displaced volume V times liquid density d times acceleration g",
  },
  quadratic: {
    latex: "ax^2 + bx + c = 0",
    spokenNepali: "ए एक्स वर्ग जोड बी एक्स जोड सी बराबर शुन्य",
    spokenEnglish: "a x squared plus b x plus c equals zero",
  },
};

export function verbalizeMathLatex(
  latex: string,
  language: "NEPALI" | "ENGLISH" = "NEPALI"
): string {
  // Check known presets
  for (const key of Object.keys(PRESET_VOCALIZED_FORMULAS)) {
    const item = PRESET_VOCALIZED_FORMULAS[key];
    if (latex.includes(key) || latex === item.latex) {
      return language === "NEPALI" ? item.spokenNepali : item.spokenEnglish;
    }
  }

  // Fallback verbalizer replacements
  const verbalized = latex
    .replace(/\\cup/g, language === "NEPALI" ? " युनियन " : " union ")
    .replace(/\\cap/g, language === "NEPALI" ? " इन्टरसेक्सन " : " intersection ")
    .replace(/\\times/g, language === "NEPALI" ? " गुणा " : " times ")
    .replace(/\\cdot/g, language === "NEPALI" ? " गुणा " : " times ")
    .replace(/=/g, language === "NEPALI" ? " बराबर " : " equals ")
    .replace(/\+/g, language === "NEPALI" ? " जोड " : " plus ")
    .replace(/-/g, language === "NEPALI" ? " घटाउ " : " minus ")
    .replace(/\\text\{([^}]+)\}/g, "$1");

  return verbalized;
}
