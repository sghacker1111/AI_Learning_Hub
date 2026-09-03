export type DiagramType =
  | "VENN_DIAGRAM"
  | "GEOMETRIC_FIGURE"
  | "FLUID_EXPERIMENT"
  | "CIRCUIT_DIAGRAM"
  | "CHART_GRAPH"
  | "TEXT_ONLY";

export interface OCRResult {
  rawText: string;
  cleanedText: string;
  detectedLanguage: "en" | "ne" | "bilingual";
  confidenceScore: number;
  extractedFormulas: string[];
  suggestedSubject: "Compulsory Mathematics" | "Science & Technology" | "General";
  suggestedChapter: string;
  hasDiagram: boolean;
}

export interface DiagramAnalysisResult {
  diagramType: DiagramType;
  description: string;
  detectedElements: string[];
  structuredData: Record<string, unknown>;
  confidence: number;
}

export interface MultimodalScanResponse {
  ocr: OCRResult;
  diagram?: DiagramAnalysisResult;
  socraticStarterPrompt: string;
  suggestedNextActions: {
    label: string;
    actionType: "tutor" | "verify" | "stem_lab";
    targetUrl: string;
  }[];
}
