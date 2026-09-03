export interface ChildActivityItem {
  id: string;
  timestamp: string;
  type: "PRACTICE" | "TUTOR" | "EXAM" | "STEM_LAB";
  title: string;
  subject: string;
  scoreOrDuration: string;
  status: "COMPLETED" | "MASTERED" | "ATTEMPTED";
}

export interface ChildProfile {
  id: string;
  name: string;
  nameNepali: string;
  grade: string;
  schoolName: string;
  overallMasteryPercentage: number;
  weeklyStudyHours: number;
  currentStreakDays: number;
  estimatedGpa: number; // e.g. 3.65
  recentExamScore: string; // "44 / 50 (88% - A)"
  masteredTopicsThisWeek: string[];
  focusAreasNeedingSupport: string[];
  recentActivities: ChildActivityItem[];
}

export interface WhatsAppDigestCard {
  recipientPhoneNumber: string;
  childName: string;
  weekRange: string;
  studyTimeHours: number;
  streakDays: number;
  estimatedGpa: number;
  masteredHighlights: string[];
  parentalTipNepali: string;
  parentalTipEnglish: string;
  formattedWhatsAppText: string;
}

export interface SMSDigestPayload {
  recipientPhoneNumber: string;
  smsGateway: "SPARROW_SMS" | "AAKASH_SMS" | "NEPAL_TELECOM";
  senderId: string; // "AI-NEPAL"
  messageNepali: string;
  messageEnglish: string;
  charCountNepali: number;
  charCountEnglish: number;
}

export interface ParentNotificationSettings {
  parentId: string;
  parentPhoneNumber: string;
  parentEmail: string;
  channels: {
    whatsapp: boolean;
    sms: boolean;
    email: boolean;
  };
  frequency: "WEEKLY_SUNDAY" | "DAILY_EVENING" | "INSTANT_EXAM_ONLY";
  dailyStudyLimitMinutes: number; // e.g. 45
  bedtimeLockEnabled: boolean;
  bedtimeLockHour: string; // e.g. "21:30"
}
