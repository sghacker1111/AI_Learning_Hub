import { CurriculumChunk, ChunkMetadata } from "./types";

export interface ChunkOptions {
  maxChunkSize?: number;
  overlap?: number;
}

/**
 * Splits textbook markdown content into chunks without breaking LaTeX math delimiters.
 */
export function chunkCurriculumText(
  rawText: string,
  metadata: ChunkMetadata
): CurriculumChunk[] {
  const chunks: CurriculumChunk[] = [];

  // Split by top-level section headers (# or ##) or paragraphs
  const rawSections = rawText.split(/(?=\n#{1,3} )/);

  let currentChunkIndex = 1;

  for (const section of rawSections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    // Extract any LaTeX equations in this section
    const latexFormulas: string[] = [];
    const displayMathMatches = trimmed.match(/\$\$([\s\S]*?)\$\$/g);
    if (displayMathMatches) {
      displayMathMatches.forEach((m) => latexFormulas.push(m.replace(/\$\$/g, "").trim()));
    }
    const inlineMathMatches = trimmed.match(/\$([^$\n]+?)\$/g);
    if (inlineMathMatches) {
      inlineMathMatches.forEach((m) => latexFormulas.push(m.replace(/\$/g, "").trim()));
    }

    // Extract potential search keywords
    const words = trimmed
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\u0900-\u097F\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);
    const uniqueKeywords = Array.from(new Set(words)).slice(0, 12);

    chunks.push({
      id: `chunk-${metadata.gradeCode}-${metadata.subjectCode}-${currentChunkIndex}`,
      content: trimmed,
      latexFormulas,
      metadata,
      keywords: uniqueKeywords,
    });

    currentChunkIndex++;
  }

  return chunks;
}
