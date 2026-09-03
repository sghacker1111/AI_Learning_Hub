import { OCRResult } from "./types";

export const SAMPLE_CDC_SCANS: Record<string, OCRResult> = {
  sample_sets: {
    rawText: "In a survey of 60 students in Class 8, 35 like Mathematics, 28 like Science, and 12 like both subjects. Find how many like neither subject.",
    cleanedText: "In a survey of 60 students in Class 8, 35 like Mathematics, 28 like Science, and 12 like both subjects. Find how many like neither subject.",
    detectedLanguage: "en",
    confidenceScore: 0.98,
    extractedFormulas: [
      "n(U) = 60",
      "n(M) = 35",
      "n(S) = 28",
      "n(M \\cap S) = 12",
      "n(M \\cup S)' = ?",
    ],
    suggestedSubject: "Compulsory Mathematics",
    suggestedChapter: "Unit 1: Sets",
    hasDiagram: true,
  },
  sample_vat: {
    rawText: "The marked price of a calculator is Rs. 1,500. If an allowance of 10% discount is given, how much does a customer pay with 13% VAT included?",
    cleanedText: "The marked price of a calculator is Rs. 1,500. If an allowance of 10% discount is given, how much does a customer pay with 13% VAT included?",
    detectedLanguage: "en",
    confidenceScore: 0.96,
    extractedFormulas: [
      "\\text{MP} = \\text{Rs. } 1500",
      "\\text{Discount} = 10\\%",
      "\\text{VAT} = 13\\%",
      "\\text{Final SP} = ?",
    ],
    suggestedSubject: "Compulsory Mathematics",
    suggestedChapter: "Unit 2: Arithmetic (13% VAT)",
    hasDiagram: false,
  },
  sample_pressure: {
    rawText: "एउटा वस्तुको हावामा तौल 30 N छ। यसलाई पानी (d = 1000 kg/m³) मा पूरै डुबाउँदा यसले 0.002 m³ पानी विस्थापित गर्छ भने यसमा लाग्ने उर्ध्वचाप र पानीमा देखिने तौल पत्ता लगाउनुहोस्।",
    cleanedText: "एउटा वस्तुको हावामा तौल ३० N छ। यसलाई पानी (d = 1000 kg/m³) मा पूरै डुबाउँदा यसले 0.002 m³ पानी विस्थापित गर्छ भने यसमा लाग्ने उर्ध्वचाप र पानीमा देखिने तौल पत्ता लगाउनुहोस्।",
    detectedLanguage: "bilingual",
    confidenceScore: 0.95,
    extractedFormulas: [
      "W_{\\text{air}} = 30 \\text{ N}",
      "d = 1000 \\text{ kg/m}^3",
      "V = 0.002 \\text{ m}^3",
      "U = V \\cdot d \\cdot g",
    ],
    suggestedSubject: "Science & Technology",
    suggestedChapter: "Unit 2: Force & Pressure",
    hasDiagram: true,
  },
};

export async function processImageOCR(
  imageData: string,
  sampleKey?: string
): Promise<OCRResult> {
  if (sampleKey && SAMPLE_CDC_SCANS[sampleKey]) {
    return SAMPLE_CDC_SCANS[sampleKey];
  }
  if (sampleKey) {
    throw new Error("Unknown scanner sample.");
  }
  if (imageData) {
    throw new Error("Live image OCR is not configured.");
  }
  throw new Error("Choose a scanner sample.");
}
