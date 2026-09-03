import { processImageOCR } from "./ocr";
import { analyzeDiagram } from "./diagram";
import { MultimodalScanResponse } from "./types";

export async function executeMultimodalPipeline(
  imageData: string,
  sampleKey?: string
): Promise<MultimodalScanResponse> {
  // 1. Run OCR and math formula recognition
  const ocrResult = await processImageOCR(imageData, sampleKey);

  // 2. Run diagram analysis if flagged
  let diagramResult;
  if (ocrResult.hasDiagram) {
    diagramResult = analyzeDiagram(
      ocrResult.suggestedSubject === "Compulsory Mathematics" ? "VENN_DIAGRAM" : "FLUID_EXPERIMENT",
      ocrResult.cleanedText
    );
  }

  // 3. Build Socratic starter prompt
  const socraticStarterPrompt = `I have scanned this problem from my Nepal CDC textbook:
"${ocrResult.cleanedText}"

Key extracted mathematical equations:
${ocrResult.extractedFormulas.join(", ")}

How do we begin solving this step by step?`;

  // 4. Generate suggested action buttons
  const suggestedNextActions: MultimodalScanResponse["suggestedNextActions"] = [
    {
      label: "Ask Socratic AI Tutor",
      actionType: "tutor",
      targetUrl: `/student/tutor?msg=${encodeURIComponent(socraticStarterPrompt)}`,
    },
  ];

  if (ocrResult.hasDiagram) {
    suggestedNextActions.push({
      label: "Open in STEM Simulation Lab",
      actionType: "stem_lab",
      targetUrl: "/student/practice/stem-lab",
    });
  }

  suggestedNextActions.push({
    label: "Verify Mathematical Step",
    actionType: "verify",
    targetUrl: `/student/practice/stem-lab`,
  });

  return {
    ocr: ocrResult,
    diagram: diagramResult,
    socraticStarterPrompt,
    suggestedNextActions,
  };
}
