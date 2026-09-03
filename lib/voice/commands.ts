import { VoiceCommandMatch } from "./types";

export const VOICE_NAVIGATION_COMMANDS = [
  {
    keywords: ["गणित", "अभ्यास", "quiz", "practice", "math practice"],
    targetRoute: "/student/practice",
    labelNepali: "गणित तथा विज्ञान अभ्यास",
    labelEnglish: "Adaptive Practice Arena",
  },
  {
    keywords: ["आजको कार्य", "दैनिक", "routine", "daily learning", "learning path"],
    targetRoute: "/student/learning",
    labelNepali: "दैनिक सिकाई कार्ययोजना",
    labelEnglish: "Daily Learning Pathway",
  },
  {
    keywords: ["परीक्षा", "ble", "see", "exam", "mock test"],
    targetRoute: "/student/exams",
    labelNepali: "BLE/SEE नमुना परीक्षा",
    labelEnglish: "BLE / SEE Board Exam Center",
  },
  {
    keywords: ["स्क्यान", "फोटो", "scanner", "camera", "textbook ocr"],
    targetRoute: "/student/scanner",
    labelNepali: "पाठ्यपुस्तक फोटो स्क्यानर",
    labelEnglish: "Textbook OCR Scanner",
  },
  {
    keywords: ["सक्रेटिस", "ट्युटर", "tutor", "ai help", "ask ai"],
    targetRoute: "/student/tutor",
    labelNepali: "सक्रेटिस एआई ट्युटर",
    labelEnglish: "Socratic AI Tutor",
  },
  {
    keywords: ["अफलाइन", "offline", "download", "pack"],
    targetRoute: "/student/offline",
    labelNepali: "अफलाइन पाठ्यक्रम डाउनलोड",
    labelEnglish: "Offline PWA Center",
  },
  {
    keywords: ["बिलिङ", "शुल्क", "रकम", "billing", "subscription", "esewa", "khalti"],
    targetRoute: "/student/billing",
    labelNepali: "सदस्यता तथा भुक्तानी",
    labelEnglish: "Subscription & Invoicing",
  },
];

export function parseVoiceCommand(transcript: string): VoiceCommandMatch | null {
  const normalized = transcript.toLowerCase().trim();

  for (const cmd of VOICE_NAVIGATION_COMMANDS) {
    for (const kw of cmd.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        return {
          matchedIntent: kw,
          targetRoute: cmd.targetRoute,
          labelNepali: cmd.labelNepali,
          labelEnglish: cmd.labelEnglish,
          confidence: 0.95,
        };
      }
    }
  }

  return null;
}
