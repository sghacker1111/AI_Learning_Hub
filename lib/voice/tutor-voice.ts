import { VoiceTranscriptItem, VoicePracticePrompt } from "./types";

export const INITIAL_VOICE_TRANSCRIPT: VoiceTranscriptItem[] = [
  {
    id: "vt-01",
    speaker: "AI_TUTOR",
    text: "Namaste Aarav! I am your Socratic Voice AI Tutor. Shall we practice 13% VAT calculations today?",
    textNepali:
      "नमस्ते आरव! म तिम्रो सक्रेटिस एआई साथी हुँ। आज हामी १३% भ्याट (Value Added Tax) को हिसाब अभ्यास गरौँ? अंकित मूल्य (Marked Price) मा १०% छुट दिएपछि भ्याट कसरी जोडिन्छ, भन त?",
    mathLatex: "\\text{SP} = \\text{MP} - \\text{Discount}, \\quad \\text{VAT} = \\text{SP} \\times 0.13",
    spokenMath:
      "सेलिङ प्राइस बराबर मार्क प्राइस माइनस डिस्काउन्ट, र भ्याट बराबर सेलिङ प्राइस गुणा शुन्य दशमलव एक तीन।",
    timestamp: "10:00 AM",
  },
];

export const VOICE_PRACTICE_PROMPTS: VoicePracticePrompt[] = [
  {
    id: "vp-01",
    title: "13% Nepal VAT Conceptual Drill",
    titleNepali: "१३% भ्याट अवधारणा मौखिक अभ्यास",
    subject: "Compulsory Mathematics",
    grade: "Class 8",
    verbalQuestion: "If a jacket costs Rs. 2,000 with a 10% discount, why must VAT be calculated after the discount is deducted?",
    verbalQuestionNepali: "रु. २,००० को ज्याकेटमा १०% छुट दिँदा भ्याट किन छुट घटाएपछि मात्र जोडिन्छ? आफ्नो शब्दमा भन।",
    sampleExpectedPoints: [
      "Customer pays VAT only on the actual selling price (SP)",
      "Discount reduces the taxable base value to Rs. 1,800",
      "13% of Rs. 1,800 equals Rs. 234",
    ],
  },
  {
    id: "vp-02",
    title: "Archimedes' Upthrust Oral Defense",
    titleNepali: "आर्किमिडिजको ऊर्ध्वचाप मौखिक व्याख्या",
    subject: "Science & Technology",
    grade: "Class 8",
    verbalQuestion: "State Archimedes' principle and explain why an iron nail sinks in water while an iron ship floats.",
    verbalQuestionNepali: "आर्किमिडिजको सिद्धान्त भन र फलामको किला पानीमा डुब्छ तर जहाज किन तैरिन्छ व्याख्या गर।",
    sampleExpectedPoints: [
      "Upthrust equals weight of displaced liquid",
      "Ship is hollow, so it displaces a large volume of water",
      "Displaced water weight exceeds total ship weight",
    ],
  },
];

export function generateVoiceSocraticTurn(studentSpeech: string): VoiceTranscriptItem {
  const normalized = studentSpeech.toLowerCase();

  if (normalized.includes("discount") || normalized.includes("छुट") || normalized.includes("vat")) {
    return {
      id: `vt-${Date.now()}`,
      speaker: "AI_TUTOR",
      text: "Excellent observation! That is correct. First we compute Selling Price (SP = MP - Discount), and then apply 13% VAT strictly on SP.",
      textNepali:
        "एकदम सही आरव! तिमीले ठ्याक्कै बुझ्यौ। पहिला हामी छुट घटाएर बिक्री मूल्य (SP) निकाल्छौँ, अनि मात्र १३% भ्याट जोड्छौँ।",
      mathLatex: "\\text{Total} = \\text{SP} + (\\text{SP} \\times 0.13)",
      spokenMath: "टोटल बराबर सेलिङ प्राइस जोड सेलिङ प्राइस गुणा शुन्य दशमलव एक तीन",
      timestamp: "Just now",
    };
  }

  return {
    id: `vt-${Date.now()}`,
    speaker: "AI_TUTOR",
    text: "I hear you! Let us think step-by-step. What is the formula for liquid pressure at depth h?",
    textNepali: "मैले सुनेँ! अब एक कदम अघि बढौँ। गहिराइ एच मा तरल पदार्थको चाप निकाल्ने सूत्र के हो, सम्झन सक्छौ?",
    mathLatex: "P = h \\cdot d \\cdot g",
    spokenMath: "पी बराबर एच गुणा डी गुणा जी",
    timestamp: "Just now",
  };
}
