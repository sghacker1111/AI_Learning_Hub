import { CDC_COMPULSORY_CATALOG, type CDCSubjectKey } from "@/lib/constants/cdc-compulsory-catalog";

export type GuruView = "dashboard" | "learn" | "classroom" | "practice" | "progress" | "history";
export type GuruSubject = CDCSubjectKey;
export type GuruGrade = `Class ${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`;
export type GuruPersona = "ram_sir" | "sita_maam";
export type GuruTutorMode = "solve_together" | "teach_me" | "hint_only" | "exam_mode" | "revision";

export interface GuruChapter {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  minutes: number;
  level: "Starter" | "Core" | "Challenge";
}

export interface GuruLessonStep {
  title: string;
  content: string;
  formula?: string;
}

export interface GuruLesson {
  title: string;
  objective: string;
  starterPrompt: string;
  steps: GuruLessonStep[];
}

export interface GuruPracticeQuestion {
  id: string;
  grade: GuruGrade;
  subject: GuruSubject;
  chapter: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export const GURU_SUBJECTS: Record<GuruSubject, { name: string; curriculumName: string; teacher: string; persona: GuruPersona; accent: string; description: string }> = {
  math: {
    name: "Mathematics",
    curriculumName: "Compulsory Mathematics",
    teacher: "Ram Sir AI",
    persona: "ram_sir" as GuruPersona,
    accent: "indigo",
    description: "Step-by-step problem solving with a live mathematical whiteboard.",
  },
  science: {
    name: "Science",
    curriculumName: "Science & Technology",
    teacher: "Sita Ma'am AI",
    persona: "sita_maam" as GuruPersona,
    accent: "teal",
    description: "Concepts, diagrams, experiments, and evidence-based explanations.",
  },
  english: {
    name: "English",
    curriculumName: "English",
    teacher: "Sita Ma'am AI",
    persona: "sita_maam",
    accent: "sky",
    description: "Reading, grammar, speaking, literature, and clear writing practice.",
  },
  nepali: {
    name: "Nepali",
    curriculumName: "Nepali",
    teacher: "Sita Ma'am AI",
    persona: "sita_maam",
    accent: "rose",
    description: "नेपाली भाषा, व्याकरण, साहित्य, पठनबोध र लेखन अभ्यास।",
  },
  social: {
    name: "Social Studies",
    curriculumName: "Social Studies & Human Values",
    teacher: "Sita Ma'am AI",
    persona: "sita_maam",
    accent: "amber",
    description: "Nepal, society, citizenship, history, geography, and human values.",
  },
  health: {
    name: "Health & Creative Arts",
    curriculumName: "Health, Physical Education & Creative Arts",
    teacher: "Sita Ma'am AI",
    persona: "sita_maam",
    accent: "emerald",
    description: "Health, safety, physical education, wellbeing, and creative expression.",
  },
};

const FEATURED_CHAPTERS: Partial<Record<GuruGrade, Partial<Record<GuruSubject, GuruChapter[]>>>> = {
  "Class 8": {
    math: [
      { id: "sets", title: "Sets & Cardinality", subtitle: "Types, relations, and Venn diagrams", progress: 72, minutes: 35, level: "Core" },
      { id: "profit-vat", title: "Profit, Loss & VAT", subtitle: "Discount, tax, and daily transactions", progress: 58, minutes: 45, level: "Core" },
      { id: "factorization", title: "Algebraic Factorization", subtitle: "Common factors and quadratic expressions", progress: 42, minutes: 50, level: "Challenge" },
      { id: "mensuration", title: "Mensuration", subtitle: "Area, surface area, and volume", progress: 33, minutes: 40, level: "Core" },
      { id: "linear-equations", title: "Linear Equations", subtitle: "Equations and word problems", progress: 65, minutes: 35, level: "Starter" },
      { id: "statistics", title: "Statistics", subtitle: "Mean, median, mode, and graphs", progress: 24, minutes: 40, level: "Core" },
    ],
    science: [
      { id: "measurement", title: "Measurement", subtitle: "Units, errors, and scientific measurement", progress: 78, minutes: 30, level: "Starter" },
      { id: "force-pressure", title: "Force & Pressure", subtitle: "Atmospheric and liquid pressure", progress: 49, minutes: 45, level: "Core" },
      { id: "energy", title: "Work, Energy & Power", subtitle: "Energy transformations and machines", progress: 37, minutes: 45, level: "Core" },
      { id: "electricity", title: "Electricity", subtitle: "Circuits, current, and resistance", progress: 31, minutes: 50, level: "Challenge" },
      { id: "cell-life", title: "Cell & Life Process", subtitle: "Cells, tissues, and body systems", progress: 62, minutes: 40, level: "Core" },
      { id: "earth-space", title: "Earth & Space", subtitle: "Earth systems and the solar system", progress: 19, minutes: 35, level: "Starter" },
    ],
  },
  "Class 10": {
    math: [
      { id: "sets", title: "Sets", subtitle: "Set operations and cardinality", progress: 82, minutes: 35, level: "Starter" },
      { id: "compound-interest", title: "Compound Interest", subtitle: "Growth, depreciation, and finance", progress: 64, minutes: 45, level: "Core" },
      { id: "currency", title: "Currency & Exchange", subtitle: "Rates, commission, and conversion", progress: 47, minutes: 40, level: "Core" },
      { id: "mensuration", title: "Mensuration", subtitle: "Combined solids and practical measures", progress: 39, minutes: 50, level: "Core" },
      { id: "quadratic", title: "Quadratic Equations", subtitle: "Factorization and quadratic formula", progress: 28, minutes: 55, level: "Challenge" },
      { id: "progression", title: "Arithmetic Progression", subtitle: "Sequences, terms, and sums", progress: 33, minutes: 45, level: "Core" },
      { id: "geometry", title: "Geometry", subtitle: "Theorems, construction, and proof", progress: 22, minutes: 50, level: "Challenge" },
      { id: "trigonometry", title: "Trigonometry", subtitle: "Ratios, identities, height, and distance", progress: 18, minutes: 55, level: "Challenge" },
      { id: "statistics", title: "Statistics", subtitle: "Grouped data and cumulative frequency", progress: 41, minutes: 45, level: "Core" },
      { id: "probability", title: "Probability", subtitle: "Events and experimental probability", progress: 36, minutes: 40, level: "Core" },
    ],
    science: [
      { id: "measurement", title: "Scientific Measurement", subtitle: "Units, precision, and calculations", progress: 84, minutes: 30, level: "Starter" },
      { id: "force", title: "Force", subtitle: "Motion, gravitation, and pressure", progress: 69, minutes: 45, level: "Core" },
      { id: "energy", title: "Energy", subtitle: "Work, power, and energy sources", progress: 54, minutes: 45, level: "Core" },
      { id: "electricity", title: "Electricity & Magnetism", subtitle: "Circuits and electromagnetic effects", progress: 43, minutes: 55, level: "Challenge" },
      { id: "chemical-reactions", title: "Chemical Reactions", subtitle: "Equations, rates, acids, and bases", progress: 37, minutes: 50, level: "Core" },
      { id: "periodic-table", title: "Periodic Classification", subtitle: "Elements and periodic trends", progress: 32, minutes: 45, level: "Core" },
      { id: "heart", title: "Human Heart", subtitle: "Circulation, blood flow, and health", progress: 26, minutes: 45, level: "Core" },
      { id: "respiration", title: "Respiration", subtitle: "Gas exchange and cellular respiration", progress: 21, minutes: 40, level: "Core" },
      { id: "genetics", title: "Genetics", subtitle: "Heredity, genes, and variation", progress: 16, minutes: 50, level: "Challenge" },
      { id: "astronomy", title: "Astronomy", subtitle: "Stars, galaxies, and the universe", progress: 12, minutes: 40, level: "Starter" },
    ],
  },
};

function chapterId(title: string, index: number): string {
  const unicodeSlug = title
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
  return `${unicodeSlug || "chapter"}-${index + 1}`;
}

const generatedChapters = Object.fromEntries(
  CDC_COMPULSORY_CATALOG.map((grade) => [
    grade.name,
    Object.fromEntries(
      grade.subjects.map((subject) => [
        subject.key,
        subject.chapters.map((title, index) => ({
          id: chapterId(title, index),
          title,
          subtitle: `CDC framework area ${index + 1} • import approved full content for strict answers`,
          progress: 0,
          minutes: 35 + (index % 3) * 5,
          level: index < 2 ? "Starter" : index < 6 ? "Core" : "Challenge",
        } satisfies GuruChapter)),
      ])
    ),
  ])
) as Record<GuruGrade, Record<GuruSubject, GuruChapter[]>>;

for (const [grade, subjects] of Object.entries(FEATURED_CHAPTERS)) {
  for (const [subject, chapters] of Object.entries(subjects || {})) {
    generatedChapters[grade as GuruGrade][subject as GuruSubject] = chapters;
  }
}

export const GURU_CHAPTERS = generatedChapters;

const SPECIAL_LESSONS: Record<string, GuruLesson> = {
  "Class 8:math:factorization": {
    title: "Algebraic Factorization",
    objective: "Recognize a quadratic expression and factor it using a reliable product-sum method.",
    starterPrompt: "Teach me how to factorize x² + 7x + 12. Explain each step and then give me one similar problem.",
    steps: [
      { title: "Read the expression", content: "Identify a = 1, b = 7, and c = 12 in the standard form.", formula: "x^2 + 7x + 12" },
      { title: "Find the pair", content: "Find two numbers whose product is 12 and whose sum is 7.", formula: "3\\times4=12,\\quad 3+4=7" },
      { title: "Write the factors", content: "Use the pair as the constants in the two binomial factors.", formula: "x^2+7x+12=(x+3)(x+4)" },
      { title: "Verify", content: "Expand the factors. The middle terms must combine to 7x.", formula: "(x+3)(x+4)=x^2+4x+3x+12" },
    ],
  },
  "Class 8:science:force-pressure": {
    title: "Force & Pressure",
    objective: "Connect force, area, and pressure to familiar real-world examples.",
    starterPrompt: "Explain pressure with the formula P = F/A. Use one example from daily life in Nepal and check the units.",
    steps: [
      { title: "Define pressure", content: "Pressure measures how much perpendicular force acts on each unit of area.", formula: "P=\\frac{F}{A}" },
      { title: "Track the units", content: "Force is measured in newtons and area in square metres.", formula: "1\\,Pa=1\\,N/m^2" },
      { title: "Compare areas", content: "For the same force, a smaller contact area produces greater pressure.", formula: "A\\downarrow\\;\\Rightarrow\\;P\\uparrow" },
      { title: "Apply it", content: "A sharp knife cuts better because its thin edge concentrates force over a small area." },
    ],
  },
  "Class 10:math:quadratic": {
    title: "Quadratic Equations",
    objective: "Solve a quadratic equation by factorization and verify both roots.",
    starterPrompt: "Teach me how to solve x² - 5x + 6 = 0 by factorization, then verify both roots.",
    steps: [
      { title: "Standard form", content: "Move every term to one side so the equation equals zero.", formula: "ax^2+bx+c=0" },
      { title: "Find the pair", content: "Choose two numbers with product 6 and sum -5.", formula: "(-2)(-3)=6,\\quad -2-3=-5" },
      { title: "Factorize", content: "Rewrite the quadratic as a product of two linear factors.", formula: "x^2-5x+6=(x-2)(x-3)" },
      { title: "Use zero-product rule", content: "At least one factor must equal zero.", formula: "x=2\\quad\\text{or}\\quad x=3" },
    ],
  },
  "Class 10:science:heart": {
    title: "Human Heart & Circulation",
    objective: "Trace blood through the four chambers and explain double circulation.",
    starterPrompt: "Trace one complete cycle of blood through the human heart. Distinguish oxygenated and deoxygenated blood clearly.",
    steps: [
      { title: "Body to right atrium", content: "Deoxygenated blood returns from the body through the venae cavae." },
      { title: "Right side to lungs", content: "It passes through the right ventricle and pulmonary artery to the lungs." },
      { title: "Lungs to left atrium", content: "Oxygenated blood returns through the pulmonary veins." },
      { title: "Left side to body", content: "The left ventricle pumps it through the aorta to the body." },
    ],
  },
};

export function getGuruChapter(grade: GuruGrade, subject: GuruSubject, chapterId: string): GuruChapter {
  const chapters = GURU_CHAPTERS[grade][subject] || [];
  return chapters.find((chapter) => chapter.id === chapterId) ?? chapters[0] ?? {
    id: "content-not-imported",
    title: "Content not imported",
    subtitle: "A Super Admin must publish this subject content.",
    progress: 0,
    minutes: 0,
    level: "Starter",
  };
}

export function getGuruLesson(grade: GuruGrade, subject: GuruSubject, chapterId: string): GuruLesson {
  const special = SPECIAL_LESSONS[`${grade}:${subject}:${chapterId}`];
  if (special) return special;

  const chapter = getGuruChapter(grade, subject, chapterId);
  const teacher = GURU_SUBJECTS[subject].teacher;
  return {
    title: chapter.title,
    objective: `Build a clear ${grade} understanding of ${chapter.title} and apply it correctly.`,
    starterPrompt: `Teach me ${chapter.title} at ${grade} level. Start with the key idea, show one worked example, and give me one check question.`,
    steps: [
      { title: "Key idea", content: `Identify the central meaning and vocabulary used in ${chapter.title}.` },
      { title: "Worked example", content: `${teacher} will build a relevant example when you start the live lesson.` },
      { title: "Reasoning check", content: "Explain why each important step or scientific claim is valid." },
      { title: "Independent practice", content: "Try a new question, then ask the AI teacher to verify your reasoning." },
    ],
  };
}

export const GURU_PRACTICE_QUESTIONS: GuruPracticeQuestion[] = [
  {
    id: "c8-math-1",
    grade: "Class 8",
    subject: "math",
    chapter: "Profit, Loss & VAT",
    prompt: "An item costs Rs. 2,000 before 13% VAT. What is the price including VAT?",
    options: ["Rs. 2,013", "Rs. 2,130", "Rs. 2,260", "Rs. 2,300"],
    answer: 2,
    explanation: "VAT = 13% of 2,000 = 260, so the total is Rs. 2,260.",
  },
  {
    id: "c8-science-1",
    grade: "Class 8",
    subject: "science",
    chapter: "Force & Pressure",
    prompt: "The same force is applied to two surfaces. Which change increases pressure?",
    options: ["Increase the area", "Decrease the area", "Keep the area unchanged", "Remove the force"],
    answer: 1,
    explanation: "Since P = F/A, pressure increases when the same force acts on a smaller area.",
  },
  {
    id: "c10-math-1",
    grade: "Class 10",
    subject: "math",
    chapter: "Quadratic Equations",
    prompt: "What are the roots of x² - 5x + 6 = 0?",
    options: ["1 and 6", "-2 and -3", "2 and 3", "-1 and -6"],
    answer: 2,
    explanation: "x² - 5x + 6 = (x - 2)(x - 3), so x = 2 or x = 3.",
  },
  {
    id: "c10-science-1",
    grade: "Class 10",
    subject: "science",
    chapter: "Human Heart",
    prompt: "Which vessel carries oxygenated blood from the lungs to the heart?",
    options: ["Pulmonary artery", "Pulmonary vein", "Aorta", "Vena cava"],
    answer: 1,
    explanation: "The pulmonary veins return oxygenated blood from the lungs to the left atrium.",
  },
];
