export const AI_REQUEST_CATEGORIES = [
  "NORMAL_CHAT",
  "ADVANCED_REASONING",
  "MATH",
  "SCIENCE",
  "CODING",
  "DATA_ANALYSIS",
  "VISION",
  "VISUAL_CREATION",
  "IMAGE_GENERATION",
] as const;

export type AIRequestCategory = (typeof AI_REQUEST_CATEGORIES)[number];

export interface AIRequestClassification {
  category: AIRequestCategory;
  confidence: number;
  reason: string;
}

const RULES: Array<{
  category: Exclude<AIRequestCategory, "NORMAL_CHAT">;
  pattern: RegExp;
  reason: string;
}> = [
  {
    category: "IMAGE_GENERATION",
    pattern: /\b(generate|create|make|draw)\b.{0,40}\b(image|picture|illustration|artwork|photo|poster)\b|\b(photo[- ]?realistic|digital art)\b/i,
    reason: "The request explicitly asks for a generated image or illustration.",
  },
  {
    category: "VISUAL_CREATION",
    pattern: /\b(diagram|flowchart|concept map|mind map|venn|timeline|chart|graph|visual|visuali[sz]e|show visual|labelled figure)\b/i,
    reason: "The request is best represented by a deterministic educational visual.",
  },
  {
    category: "VISION",
    pattern: /\b(uploaded image|this image|this photo|scan this|read this diagram|what is shown)\b/i,
    reason: "The request asks the system to understand an existing image.",
  },
  {
    category: "DATA_ANALYSIS",
    pattern: /\b(csv|spreadsheet|dataset|mean|median|standard deviation|correlation|regression|analy[sz]e data)\b/i,
    reason: "The request contains a data-analysis task.",
  },
  {
    category: "CODING",
    pattern: /\b(code|program|function|algorithm|debug|typescript|javascript|python|java|html|css|sql)\b/i,
    reason: "The request contains a programming task.",
  },
  {
    category: "MATH",
    pattern: /\b(calculate|solve|equation|algebra|geometry|factori[sz]e|derivative|integral|percentage|ratio|probability|set theory)\b|[=+×÷]/i,
    reason: "The request contains a mathematical problem.",
  },
  {
    category: "SCIENCE",
    pattern: /\b(physics|chemistry|biology|force|pressure|energy|cell|atom|molecule|photosynthesis|water cycle|solar system)\b/i,
    reason: "The request contains a science topic.",
  },
  {
    category: "ADVANCED_REASONING",
    pattern: /\b(prove|derive|compare critically|evaluate the evidence|multi[- ]step|reason carefully|justify)\b/i,
    reason: "The request calls for deeper multi-step reasoning.",
  },
];

export function classifyAIRequest(input: string): AIRequestClassification {
  const normalized = input.trim();

  for (const rule of RULES) {
    if (rule.pattern.test(normalized)) {
      return { category: rule.category, confidence: 0.9, reason: rule.reason };
    }
  }

  return {
    category: "NORMAL_CHAT",
    confidence: 0.65,
    reason: "No specialist tool intent was detected, so the chat model is appropriate.",
  };
}
