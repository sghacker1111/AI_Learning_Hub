export type VoiceTutorState = "IDLE" | "LISTENING" | "THINKING" | "SPEAKING";

export interface VoiceTranscriptItem {
  id: string;
  speaker: "STUDENT" | "AI_TUTOR";
  text: string;
  textNepali?: string;
  mathLatex?: string;
  spokenMath?: string;
  timestamp: string;
}

export interface VocalizedFormula {
  latex: string;
  spokenNepali: string;
  spokenEnglish: string;
}

export interface VoiceCommandMatch {
  matchedIntent: string;
  targetRoute: string;
  labelNepali: string;
  labelEnglish: string;
  confidence: number;
}

export interface TTSConfig {
  voiceAccent: "NEPALI_NATURAL" | "ENGLISH_STANDARD";
  playbackRate: number; // 0.75, 1.0, 1.25
  pitch: number;
  handsFreeMode: boolean;
}

export interface VoicePracticePrompt {
  id: string;
  title: string;
  titleNepali: string;
  subject: string;
  grade: string;
  verbalQuestion: string;
  verbalQuestionNepali: string;
  sampleExpectedPoints: string[];
}
