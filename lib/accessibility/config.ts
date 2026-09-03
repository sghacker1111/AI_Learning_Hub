import { AccessibilityPreferences, WCAGScorecardItem } from "./types";

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  contrastMode: "STANDARD",
  fontFamily: "DEFAULT",
  textSize: "100%",
  lineSpacing: "NORMAL",
  letterSpacingExpanded: false,
  reducedMotion: false,
  highVisibilityFocus: true,
  mathAriaReaderEnabled: true,
  dyslexiaRulerGuide: false,
};

export const DYSLEXIA_PRESET_PREFERENCES: AccessibilityPreferences = {
  contrastMode: "AMBER_SEPIA",
  fontFamily: "OPENDYSLEXIC",
  textSize: "115%",
  lineSpacing: "RELAXED",
  letterSpacingExpanded: true,
  reducedMotion: true,
  highVisibilityFocus: true,
  mathAriaReaderEnabled: true,
  dyslexiaRulerGuide: true,
};

export const HIGH_CONTRAST_PRESET_PREFERENCES: AccessibilityPreferences = {
  contrastMode: "HIGH_CONTRAST_DARK",
  fontFamily: "LEXEND",
  textSize: "115%",
  lineSpacing: "RELAXED",
  letterSpacingExpanded: false,
  reducedMotion: true,
  highVisibilityFocus: true,
  mathAriaReaderEnabled: true,
  dyslexiaRulerGuide: false,
};

export const WCAG_SCORECARD: WCAGScorecardItem[] = [
  {
    criterion: "1.4.3 Contrast (Minimum)",
    level: "AA",
    status: "NOT_AUDITED",
    score: "Needs audit",
    description: "Contrast modes are implemented, but representative pages still require automated and manual contrast testing.",
  },
  {
    criterion: "1.4.12 Text Spacing & Dyslexia Typography",
    level: "AA",
    status: "NOT_AUDITED",
    score: "Needs audit",
    description: "Text-spacing controls are implemented and require browser and assistive-technology verification.",
  },
  {
    criterion: "2.1.1 Full Keyboard Navigation",
    level: "AA",
    status: "NOT_AUDITED",
    score: "Needs audit",
    description: "Keyboard focus styles exist, but every route and dialog has not been manually audited.",
  },
  {
    criterion: "1.1.1 Non-Text Content & Math ARIA",
    level: "AA",
    status: "NOT_AUDITED",
    score: "Needs audit",
    description: "Math rendering includes accessible labels in supported views; complete screen-reader coverage is not certified.",
  },
  {
    criterion: "2.3.3 Reduced Motion Suppression",
    level: "AAA",
    status: "NOT_AUDITED",
    score: "Needs audit",
    description: "Reduced-motion preferences are supported, but animation behavior still requires a full audit.",
  },
];
