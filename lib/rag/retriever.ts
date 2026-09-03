import { CurriculumChunk, RAGQueryRequest, RAGQueryResult, RAGQueryResultChunk } from "./types";
import { CDC_CURRICULUM_KNOWLEDGE_BASE } from "./knowledge-base";
import { generateCitationString } from "./citation";
import { loadPublishedCurriculumChunks } from "./database-knowledge";
import { matchesCurriculumChapter } from "./chapter-filter";

const RAG_STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "give", "how", "i", "in", "is", "it", "me", "of", "on", "or", "please", "show", "that", "the", "this", "to", "use", "verify", "what", "with", "you", "your",
  "छ", "छन्", "को", "का", "की", "गर्नु", "र", "लाई", "मा", "यो",
]);

/**
 * Computes deterministic dense hash vector for cosine similarity simulation
 */
function computeDeterministicVector(text: string, dim: number = 64): number[] {
  const vec = new Array(dim).fill(0);
  const clean = text.toLowerCase();
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    vec[i % dim] += (code % 31) / 31;
  }
  // Normalize vector
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vec.map((v) => v / norm);
}

function cosineSimilarity(vA: number[], vB: number[]): number {
  let dot = 0;
  for (let i = 0; i < vA.length; i++) {
    dot += vA[i] * vB[i];
  }
  return Math.max(0, Math.min(1, dot));
}

/**
 * Computes BM25-like sparse keyword match score
 */
function computeSparseBM25Score(queryTokens: string[], chunk: CurriculumChunk): number {
  let score = 0;
  const chunkText = (chunk.content + " " + (chunk.contentNepali || "") + " " + chunk.metadata.sectionTitle).toLowerCase();

  for (const token of queryTokens) {
    if (!token || token.length < 2) continue;

    // Exact word boundary match
    const reg = new RegExp(`\\b${token}\\b`, "i");
    if (reg.test(chunkText)) {
      score += 2.0;
    } else if (chunkText.includes(token)) {
      score += 1.0;
    }

    // Direct keyword tag match boost
    if (chunk.keywords.some((k) => k.toLowerCase() === token)) {
      score += 3.0;
    }
  }

  return score;
}

export async function hybridRetrieveCDC(request: RAGQueryRequest): Promise<RAGQueryResult> {
  const startTime = Date.now();
  const { query, grade, subject } = request;
  const topK = Math.min(10, Math.max(1, Number.isFinite(request.topK) ? Math.floor(request.topK!) : 3));
  const hybridAlpha = Math.min(1, Math.max(0, Number.isFinite(request.hybridAlpha) ? request.hybridAlpha! : 0.65));

  const queryVector = computeDeterministicVector(query);
  const queryTokens = query
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\u0900-\u097F\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 2 && !RAG_STOP_WORDS.has(token));

  const databaseChunks = await loadPublishedCurriculumChunks({ grade, subject });
  // Once a Super Admin has published matching content, it becomes authoritative.
  // Bundled samples are used only when no published database content is available.
  let pool = databaseChunks.length ? databaseChunks : CDC_CURRICULUM_KNOWLEDGE_BASE;

  // Optional Metadata Filtering
  if (grade && grade !== "ALL") {
    pool = pool.filter((c) => c.metadata.gradeCode.toLowerCase() === grade.toLowerCase() || c.metadata.grade.toLowerCase() === grade.toLowerCase());
  }
  if (subject && subject !== "ALL") {
    pool = pool.filter((c) => c.metadata.subjectCode.toLowerCase() === subject.toLowerCase() || c.metadata.subject.toLowerCase().includes(subject.toLowerCase()));
  }

  // Calculate dense and sparse scores
  if (request.chapter) pool = pool.filter((chunk) => matchesCurriculumChapter(request.chapter!, chunk.metadata.chapter));
  const scoredChunks: RAGQueryResultChunk[] = pool.map((chunk) => {
    const chunkVector = computeDeterministicVector(chunk.content);
    const denseScore = cosineSimilarity(queryVector, chunkVector);
    const sparseRawScore = computeSparseBM25Score(queryTokens, chunk);
    const normalizedSparse = Math.min(1.0, sparseRawScore / 8.0);

    // Hybrid combination: alpha * dense + (1 - alpha) * sparse
    const hybridScore = hybridAlpha * denseScore + (1 - hybridAlpha) * normalizedSparse;
    const citationString = generateCitationString(chunk.metadata);

    return {
      chunk,
      score: Math.round(hybridScore * 1000) / 1000,
      denseScore: Math.round(denseScore * 1000) / 1000,
      sparseScore: Math.round(normalizedSparse * 1000) / 1000,
      citationString,
    };
  });

  // Sort by highest hybrid score
  scoredChunks.sort((a, b) => b.score - a.score);

  const topChunks = scoredChunks.slice(0, topK);
  const latencyMs = Date.now() - startTime;

  return {
    query,
    topChunks,
    totalMatches: scoredChunks.filter((s) => s.score > 0.3).length,
    latencyMs,
    citationFootnotes: topChunks.map((c) => c.citationString),
  };
}
