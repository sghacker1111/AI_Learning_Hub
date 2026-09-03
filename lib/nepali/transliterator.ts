import { TransliterationResult } from "./types";

const COMMON_WORD_MAP: Record<string, string> = {
  namaste: "नमस्ते",
  dhanyabad: "धन्यवाद",
  sathi: "साथी",
  sathiharu: "साथीहरू",
  tapai: "तपाईं",
  timi: "तिमी",
  ma: "म",
  maile: "मैले",
  mero: "मेरो",
  hamro: "हाम्रो",
  bhaneko: "भनेको",
  k: "के",
  ke: "के",
  ho: "हो",
  hoina: "होइन",
  cha: "छ",
  chaina: "छैन",
  kasari: "कसरी",
  kina: "किन",
  kahile: "कहिले",
  kaha: "कहाँ",
  kati: "कति",
  yo: "यो",
  tyo: "त्यो",
  ani: "अनि",
  ra: "र",
  tar: "तर",
  tara: "तर",
  bujhe: "बुझे",
  bujhina: "बुझिन",
  garne: "गर्ने",
  garum: "गरौँ",
  garus: "गरोस्",
  sikne: "सिक्ने",
  padhne: "पढ्ने",
  nepal: "नेपाल",
  kitab: "किताब",
  ganit: "गणित",
  bigyan: "विज्ञान",
  samuha: "समूह",
  urdhwachap: "उर्ध्वचाप",
  ghatane: "घटाउने",
  jodne: "जोड्ने",
  gunan: "गुणन",
  bhag: "भाग",
  uttar: "उत्तर",
  prashna: "प्रश्न",
  sir: "सर",
  madam: "म्याम",
};

/**
 * Phonetic character replacement map
 */
const VOWELS: Record<string, string> = {
  aa: "ा",
  a: "",
  ii: "ी",
  i: "ि",
  ee: "ी",
  uu: "ू",
  u: "ु",
  oo: "ू",
  ai: "ै",
  au: "ौ",
  e: "े",
  o: "ो",
  ri: "ृ",
};

const INITIAL_VOWELS: Record<string, string> = {
  aa: "आ",
  a: "अ",
  ii: "ई",
  i: "इ",
  ee: "ई",
  uu: "ऊ",
  u: "उ",
  oo: "ऊ",
  ai: "ऐ",
  au: "औ",
  e: "ए",
  o: "ओ",
  ri: "ऋ",
};

const CONSONANTS: Record<string, string> = {
  k: "क",
  kh: "ख",
  g: "ग",
  gh: "घ",
  ng: "ङ",
  ch: "च",
  chh: "छ",
  j: "ज",
  jh: "झ",
  yn: "ञ",
  t: "त",
  th: "थ",
  d: "द",
  dh: "ध",
  n: "न",
  p: "प",
  ph: "फ",
  f: "फ",
  b: "ब",
  bh: "भ",
  m: "म",
  y: "य",
  r: "र",
  l: "ल",
  w: "व",
  v: "व",
  sh: "श",
  shh: "ष",
  s: "स",
  h: "ह",
  gy: "ज्ञ",
  tr: "त्र",
  ksh: "क्ष",
};

/**
 * Transliterates a single Romanized Nepali word into Devanagari script.
 */
export function transliterateWord(word: string): string {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return word;

  // 1. Direct dictionary lookup for common phrases & words
  if (COMMON_WORD_MAP[clean]) {
    return COMMON_WORD_MAP[clean];
  }

  // 2. Multi-letter phonetic parsing
  let output = "";
  let i = 0;

  while (i < clean.length) {
    // Check 3-letter consonant combinations (ksh, chh, shh)
    const three = clean.substring(i, i + 3);
    const two = clean.substring(i, i + 2);
    const one = clean.substring(i, i + 1);

    if (CONSONANTS[three]) {
      output += CONSONANTS[three];
      i += 3;
    } else if (CONSONANTS[two]) {
      output += CONSONANTS[two];
      i += 2;
    } else if (CONSONANTS[one]) {
      output += CONSONANTS[one];
      i += 1;
    } else if (i === 0 && INITIAL_VOWELS[two]) {
      output += INITIAL_VOWELS[two];
      i += 2;
    } else if (i === 0 && INITIAL_VOWELS[one]) {
      output += INITIAL_VOWELS[one];
      i += 1;
    } else if (VOWELS[two] !== undefined) {
      output += VOWELS[two];
      i += 2;
    } else if (VOWELS[one] !== undefined) {
      output += VOWELS[one];
      i += 1;
    } else {
      output += clean[i];
      i++;
    }
  }

  return output;
}

/**
 * Transliterates a full sentence of Romanized Nepali to Devanagari.
 */
export function transliterateRomanizedToDevanagari(text: string): TransliterationResult {
  if (!text) {
    return {
      originalText: "",
      devanagariText: "",
      detectedRegister: "PURE_ENGLISH",
      wordCount: 0,
    };
  }

  const tokens = text.split(/(\s+|[.,!?;:()]+)/);
  const converted = tokens
    .map((token) => {
      if (/^[a-zA-Z]+$/.test(token)) {
        return transliterateWord(token);
      }
      return token;
    })
    .join("");

  return {
    originalText: text,
    devanagariText: converted,
    detectedRegister: "ROMANIZED_NEPALI",
    wordCount: text.trim().split(/\s+/).length,
  };
}
