export type ContrastMode =
  | "STANDARD"
  | "HIGH_CONTRAST_DARK"
  | "HIGH_CONTRAST_LIGHT"
  | "AMBER_SEPIA";

export type FontFamilyChoice = "DEFAULT" | "LEXEND" | "OPENDYSLEXIC" | "DEVANAGARI_BOLD";

export type TextSizeScale = "90%" | "100%" | "115%" | "130%";

export type LineSpacingChoice = "NORMAL" | "RELAXED" | "LOOSE";

export interface AccessibilityPreferences {
  contrastMode: ContrastMode;
  fontFamily: FontFamilyChoice;
  textSize: TextSizeScale;
  lineSpacing: LineSpacingChoice;
  letterSpacingExpanded: boolean;
  reducedMotion: boolean;
  highVisibilityFocus: boolean;
  mathAriaReaderEnabled: boolean;
  dyslexiaRulerGuide: boolean;
}

export interface WCAGScorecardItem {
  criterion: string;
  level: "A" | "AA" | "AAA";
  status: "PASS" | "EXCEEDS" | "NOT_AUDITED";
  score: string;
  description: string;
}
