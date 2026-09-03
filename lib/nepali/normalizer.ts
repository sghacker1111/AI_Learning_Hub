const NEPALI_NUMERALS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
const ENGLISH_NUMERALS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * Clean up zero-width joiners, invisible characters, and standardize diacritics.
 */
export function normalizeDevanagari(text: string): string {
  if (!text) return "";

  return text
    .replace(/\uFEFF/g, "") // Byte Order Mark
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // Zero width spaces and joiners
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .replace(/\|\s*\|/g, "॥") // Double danda
    .replace(/\|/g, "।") // Single pipe to Nepali Danda
    .trim();
}

/**
 * Converts Devanagari numerals (०-९) to English Arabic numerals (0-9).
 */
export function nepaliToArabicNumerals(text: string): string {
  if (!text) return "";
  let result = text;
  for (let i = 0; i < 10; i++) {
    const reg = new RegExp(NEPALI_NUMERALS[i], "g");
    result = result.replace(reg, ENGLISH_NUMERALS[i]);
  }
  return result;
}

/**
 * Converts English Arabic numerals (0-9) to Nepali Devanagari numerals (०-९).
 */
export function arabicToNepaliNumerals(text: string | number): string {
  if (text === undefined || text === null) return "";
  let result = String(text);
  for (let i = 0; i < 10; i++) {
    const reg = new RegExp(ENGLISH_NUMERALS[i], "g");
    result = result.replace(reg, NEPALI_NUMERALS[i]);
  }
  return result;
}
