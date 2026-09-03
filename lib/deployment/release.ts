import { ReleaseMetadata, PhaseAuditItem } from "./types";

const FEATURE_DEFINITIONS = [
  [1, "Foundation & Core Layout", "आधारभूत संरचना र लेआउट", "Core UI"],
  [2, "Database, Prisma & Auth", "डाटाबेस, प्रिज्मा र प्रमाणीकरण", "Auth & DB"],
  [3, "Curriculum CMS Prototype", "पाठ्यक्रम व्यवस्थापन नमुना", "Curriculum"],
  [4, "Multi-Provider AI Routing", "एआई बहु-प्रदायक गेटवे", "AI Core"],
  [5, "Socratic Tutoring Prototype", "सक्रेटिस सिकाई संवाद नमुना", "Socratic AI"],
  [6, "STEM Specialized Solvers", "गणित र विज्ञान समस्या समाधान", "STEM Lab"],
  [7, "Devanagari Normalizer", "देवनागरी सामान्यीकरण इन्जिन", "Localization"],
  [8, "KaTeX Math Typesetting", "गणितीय सूत्र र रेखाचित्र", "Mathematics"],
  [9, "Scanner Sample Interface", "पाठ्यपुस्तक स्क्यानर नमुना", "Computer Vision"],
  [10, "Deterministic Retrieval Demo", "पाठ्यक्रम खोज नमुना", "RAG Demo"],
  [11, "Adaptive Practice Prototype", "अनुकूलित अभ्यास नमुना", "Practice"],
  [12, "Class 8 Mini-Paper", "कक्षा ८ अभ्यास परीक्षा", "Assessment"],
  [13, "Mastery Graph Demonstration", "सिकाई दक्षता नक्साङ्कन नमुना", "Diagnostics"],
  [14, "Learning Path Demonstration", "व्यक्तिगत सिकाई कार्ययोजना नमुना", "Pathway"],
  [15, "Teacher Portal & Templates", "शिक्षक पोर्टल र योजना नमुना", "Teacher Suite"],
  [16, "Parent Portal & Digest Preview", "अभिभावक पोर्टल र सूचना नमुना", "Parent Suite"],
  [17, "School Portal & IEMIS Format Demo", "विद्यालय प्रशासन र IEMIS ढाँचा नमुना", "School"],
  [18, "Gamification Demonstration", "गेमिफिकेसन नमुना", "Gamification"],
  [19, "Classroom Interface Demo", "कक्षा र डिजिटल पाटी नमुना", "Classroom"],
  [20, "Basic Offline Fallback", "आधारभूत अफलाइन पृष्ठ", "Offline PWA"],
  [21, "Payment Sandbox Preview", "भुक्तानी नमुना", "Billing"],
  [22, "Text Voice-UI Demonstration", "मौखिक संवाद नमुना", "Voice UI"],
  [23, "Local Health & Metrics", "स्थानीय प्रणाली निगरानी", "Observability"],
  [24, "Accessibility Work", "पहुँचयोग्यता कार्य", "Accessibility"],
  [25, "Recovery Interface Demo", "पुनर्स्थापना नमुना", "Data Resilience"],
  [26, "Deployment Readiness", "तैनाथी तयारी", "DevOps"],
] as const;

export const MASTER_26_PHASES_AUDIT: PhaseAuditItem[] = FEATURE_DEFINITIONS.map(
  ([promptNumber, title, titleNepali, category]) => ({
    promptNumber,
    title,
    titleNepali,
    category,
    isCompleted: false,
    verifiedRoutesCount: 0,
  })
);

export function getProductionReleaseMetadata(): ReleaseMetadata {
  return {
    version: "v0.1.0-local",
    releaseName: "AI Learning Nepal — Local Readiness Build",
    releaseNameNepali: "एआई लर्निङ नेपाल - स्थानीय तयारी बिल्ड",
    buildNumber: 0,
    gitCommitSha: "unavailable",
    targetRegions: [],
    totalRoutesCompiled: 134,
    auditPassedPhasesCount: 0,
    totalPhasesCount: FEATURE_DEFINITIONS.length,
    releaseDateBs: "Unavailable",
    releaseDateUtc: new Date().toISOString(),
    dockerImageTag: "not-built",
    isProductionActive: false,
  };
}
