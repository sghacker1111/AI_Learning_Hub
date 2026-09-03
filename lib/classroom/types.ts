export type WhiteboardTool =
  | "PEN"
  | "HIGHLIGHTER"
  | "RECTANGLE"
  | "CIRCLE_VENN"
  | "LINE"
  | "FORMULA_STAMP"
  | "ERASER";

export interface FormulaStamp {
  id: string;
  label: string;
  latex: string;
}

export interface WhiteboardStroke {
  id: string;
  tool: WhiteboardTool;
  color: string;
  strokeWidth: number;
  points: { x: number; y: number }[];
  formulaLatex?: string;
}

export interface Participant {
  id: string;
  name: string;
  role: "TEACHER" | "STUDENT" | "AI_ASSISTANT";
  isMuted: boolean;
  isVideoOn: boolean;
  isHandRaised: boolean;
  hasDrawPermission: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "TEACHER" | "STUDENT" | "AI_ASSISTANT";
  content: string;
  timestamp: string;
  isQuestion?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votesCount: number;
  isCorrect?: boolean;
}

export interface LivePoll {
  id: string;
  question: string;
  questionNepali: string;
  options: PollOption[];
  totalVotes: number;
  isActive: boolean;
  durationSeconds: number;
}

export interface ClassroomSession {
  id: string;
  title: string;
  titleNepali: string;
  subject: string;
  grade: string;
  chapter: string;
  teacherName: string;
  activeParticipantsCount: number;
  participants: Participant[];
  currentPoll?: LivePoll;
  strokes: WhiteboardStroke[];
  messages: ChatMessage[];
  aiSuggestions: string[];
}
