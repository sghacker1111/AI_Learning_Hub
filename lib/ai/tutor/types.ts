import type { AIRequestCategory } from "../classifier";
import type { GuruPersona, GuruTutorMode } from "@/lib/guru-ai/catalog";
import type { WhiteboardEvent } from "@/lib/guru-ai/whiteboard";

export type SocraticStage =
  | "STAGE_1_DIAGNOSIS"
  | "STAGE_2_GUIDED_EXPLORATION"
  | "STAGE_3_CONCEPTUAL_BRIDGE"
  | "STAGE_4_INDEPENDENT_CALCULATION"
  | "STAGE_5_MASTERY_CONFIRMED";

export type HintTier = 1 | 2 | 3;

export interface TutorMessageItem {
  whiteboard?: WhiteboardEvent[];
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  mathSnippet?: string | null;
  stage?: SocraticStage;
  citations?: {
    grade: string;
    subject: string;
    chapter: string;
    page?: string | number;
  }[];
  timestamp: string;
  requestCategory?: AIRequestCategory;
}

export interface TutorChatRequest {
  stream?: boolean;
  sessionId?: string;
  message: string;
  grade?: string;
  subject?: string;
  chapter?: string;
  lessonId?: string;
  outcomeCode?: string;
  language?: "en" | "ne" | "bilingual";
  currentStage?: SocraticStage;
  persona?: GuruPersona;
  tutorMode?: GuruTutorMode;
  curriculumOnly?: boolean;
  history?: Array<Pick<TutorMessageItem, "role" | "content">>;
}

export interface TutorChatResponse {
  message: TutorMessageItem;
  sessionId: string;
  currentStage: SocraticStage;
  masteryScoreDelta?: number;
  newMasteryScore?: number;
  usedFallback: boolean;
  isSimulated?: boolean;
  provider: string;
  requestCategory: AIRequestCategory;
  grounding?: {
    mode: "curriculum_only" | "curriculum_preferred";
    matchedChunks: number;
    sources: Array<{
      grade: string;
      subject: string;
      chapter: string;
      section: string;
      edition: string;
      pages?: string;
    }>;
  };
}

export interface HintResponse {
  tier: HintTier;
  hintText: string;
  latexSnippet?: string;
  nextTierAvailable: boolean;
}
