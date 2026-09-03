import { SubscriptionPlan, TaxBreakdown } from "./types";

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "plan-starter",
    name: "Free Starter",
    nameNepali: "आधारभूत निःशुल्क",
    tagline: "Explore the current Class 8 prototype at no charge.",
    monthlyPriceNpr: 0,
    annualPriceNpr: 0,
    features: [
      "Class 8 sample practice activities",
      "Rule-based math and science examples",
      "Small demonstration content library",
      "Basic offline fallback page",
    ],
    featuresNepali: [
      "कक्षा ८ का नमुना अभ्यास गतिविधिहरू",
      "नियममा आधारित गणित र विज्ञान उदाहरणहरू",
      "सानो प्रदर्शन सामग्री सङ्ग्रह",
      "आधारभूत अफलाइन पृष्ठ",
    ],
    maxChildren: 1,
    unlimitedTutor: false,
    fullMockExams: false,
    offlinePacks: false,
    parentDigests: false,
  },
  {
    id: "plan-pro",
    name: "Student Pro",
    nameNepali: "विद्यार्थी प्रो",
    tagline: "Preview proposed student features in the sandbox.",
    monthlyPriceNpr: 499,
    annualPriceNpr: 4499,
    isPopular: true,
    features: [
      "AI tutor preview with configured-provider or simulated fallback",
      "Class 8 practice mini-paper generator",
      "Step-by-step rule-based math and science solvers",
      "Sample offline learning pages",
      "Textbook scanner interface with sample inputs",
      "Demonstration learning pathway and milestones",
    ],
    featuresNepali: [
      "कन्फिगर गरिएको वा नमुना एआई ट्युटर पूर्वावलोकन",
      "कक्षा ८ अभ्यास लघु-परीक्षा निर्माता",
      "नियममा आधारित चरणबद्ध गणित र विज्ञान समाधान",
      "नमुना अफलाइन सिकाइ पृष्ठहरू",
      "नमुना इनपुट भएको स्क्यानर इन्टरफेस",
      "प्रदर्शन सिकाइ कार्ययोजना र लक्ष्यहरू",
    ],
    maxChildren: 1,
    unlimitedTutor: false,
    fullMockExams: false,
    offlinePacks: false,
    parentDigests: false,
  },
  {
    id: "plan-family",
    name: "Family Pack",
    nameNepali: "पारिवारिक प्याक",
    tagline: "Preview proposed family supervision features.",
    monthlyPriceNpr: 899,
    annualPriceNpr: 7999,
    features: [
      "Student prototype previews for up to 3 child profiles",
      "Parent portal and multi-child interface preview",
      "WhatsApp and SMS digest preview without message delivery",
      "Screen-time controls interface without enforcement",
      "AI provider configuration preview",
    ],
    featuresNepali: [
      "३ जना बच्चाको प्रोफाइलसम्मको नमुना सुविधा",
      "अभिभावक पोर्टल र बच्चा छनौट पूर्वावलोकन",
      "सन्देश नपठाइने व्हाट्सएप र एसएमएस नमुना",
      "कार्यान्वयन नभएको स्क्रिन-समय इन्टरफेस",
      "एआई प्रदायक कन्फिगरेसन पूर्वावलोकन",
    ],
    maxChildren: 3,
    unlimitedTutor: false,
    fullMockExams: false,
    offlinePacks: false,
    parentDigests: false,
  },
  {
    id: "plan-enterprise",
    name: "School Enterprise",
    nameNepali: "विद्यालय संस्थागत",
    tagline: "Preview proposed school administration workflows.",
    monthlyPriceNpr: 2499,
    annualPriceNpr: 24999,
    features: [
      "Demonstration student and faculty records",
      "IEMIS-format validation preview without ministry sync",
      "Teacher portal and sample lesson-plan workflow",
      "Demonstration mastery heatmaps",
      "Whiteboard interface preview",
      "Sample readiness scorecards",
    ],
    featuresNepali: [
      "प्रदर्शन विद्यार्थी र शिक्षक अभिलेख",
      "मन्त्रालय सिंकबिनाको IEMIS ढाँचा जाँच",
      "शिक्षक पोर्टल र नमुना पाठयोजना कार्यप्रवाह",
      "प्रदर्शन सिकाइ नक्सा",
      "डिजिटल पाटी इन्टरफेस पूर्वावलोकन",
      "नमुना तयारी प्रतिवेदन",
    ],
    maxChildren: 500,
    unlimitedTutor: false,
    fullMockExams: false,
    offlinePacks: false,
    parentDigests: false,
  },
];

export function calculateNepalVAT(totalAmountNpr: number): TaxBreakdown {
  if (totalAmountNpr <= 0) {
    return {
      baseAmountNpr: 0,
      vatRatePercent: 13,
      vatAmountNpr: 0,
      totalAmountNpr: 0,
    };
  }

  // Base = Total / 1.13
  const baseAmount = Number((totalAmountNpr / 1.13).toFixed(2));
  const vatAmount = Number((totalAmountNpr - baseAmount).toFixed(2));

  return {
    baseAmountNpr: baseAmount,
    vatRatePercent: 13,
    vatAmountNpr: vatAmount,
    totalAmountNpr: totalAmountNpr,
  };
}
