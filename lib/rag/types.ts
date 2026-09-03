export interface ChunkMetadata {
  grade: string; // e.g. "Class 8"
  gradeCode: string; // "class-8"
  subject: string; // "Compulsory Mathematics"
  subjectCode: string; // "MTH-801"
  unit: string; // "Unit 1: Sets"
  chapter: string; // "Cardinality of Sets"
  learningOutcomeCode: string; // "LO-MTH801-1.1"
  pageRange: string; // "12-15"
  curriculumEdition: string; // e.g. "DEMO_CLASS8_SAMPLE"
  sectionTitle: string;
}

export interface CurriculumChunk {
  id: string;
  content: string;
  contentNepali?: string;
  latexFormulas: string[];
  metadata: ChunkMetadata;
  denseVector?: number[];
  keywords: string[];
}

export interface RAGQueryRequest {
  query: string;
  chapter?: string;
  grade?: string;
  subject?: string;
  topK?: number;
  hybridAlpha?: number; // 0.0 (Pure Sparse BM25) to 1.0 (Pure Dense Vector)
}

export interface RAGQueryResultChunk {
  chunk: CurriculumChunk;
  score: number;
  denseScore: number;
  sparseScore: number;
  citationString: string;
}

export interface RAGQueryResult {
  query: string;
  topChunks: RAGQueryResultChunk[];
  totalMatches: number;
  latencyMs: number;
  citationFootnotes: string[];
}

export interface RAGIndexStats {
  totalChunks: number;
  indexedGrades: number;
  indexedSubjects: number;
  vectorDimension: number;
  hybridStatus: "DETERMINISTIC_DEMO_RETRIEVAL";
  averageRetrievalLatencyMs: number | null;
}
