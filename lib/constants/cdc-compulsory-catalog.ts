export type CDCClassCode = `class-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`;
export type CDCSubjectKey = "math" | "science" | "english" | "nepali" | "social" | "health";

export interface CDCSubjectCatalogItem {
  key: CDCSubjectKey;
  code: string;
  name: string;
  nameNepali: string;
  chapters: string[];
}

export interface CDCGradeCatalogItem {
  code: CDCClassCode;
  name: string;
  level: "Basic Level" | "Secondary Level";
  sourceTitle: string;
  sourceUrl: string;
  catalogStatus: "OFFICIAL_FRAMEWORK_SCAFFOLD";
  subjects: CDCSubjectCatalogItem[];
}

const OFFICIAL_SOURCES = {
  primary: {
    title: "CDC Basic Level Integrated Curriculum 2076, Grades 1-3",
    url: "https://lib.moecdc.gov.np/catalog/opac_css/index.php?id_rubrique=81&lvl=cmspage&pageid=6",
  },
  grade45: {
    title: "CDC Basic Education Curriculum 2078, Grades 4-5 Compulsory Subjects",
    url: "https://moecdc.gov.np/content/203/basic-education-courses--2078--class-4-5--mandatory/",
  },
  grade68: {
    title: "CDC Basic Education Curriculum 2077, Grades 6-8 Compulsory Subjects",
    url: "https://moecdc.gov.np/content/202/basic-education-courses--2077--class-6-8--mandatory/",
  },
  grade910: {
    title: "CDC Secondary Education Curriculum 2078, Grades 9-10 Compulsory Subjects",
    url: "https://moecdc.gov.np/content/201/secondary-education-curssions--2078--class-9-10--mandatory/",
  },
  grade1112: {
    title: "CDC Secondary Education Curriculum for Grades 11-12 Compulsory Subjects",
    url: "https://moecdc.gov.np/content/160/secondary-education-curriculum--2077-grade-11-12-part/",
  },
} as const;

const MATHEMATICS_CHAPTERS: Record<number, string[]> = {
  1: ["Numbers to 100", "Addition", "Subtraction", "Shapes and Patterns", "Measurement, Time and Money", "Simple Data"],
  2: ["Numbers to 1,000", "Addition and Subtraction", "Multiplication and Division", "Fractions", "Geometry", "Measurement, Time and Money", "Data and Patterns"],
  3: ["Whole Numbers", "Four Fundamental Operations", "Fractions", "Geometry", "Measurement", "Time and Money", "Patterns and Data"],
  4: ["Whole Numbers and Operations", "Factors and Multiples", "Fractions and Decimals", "Geometry", "Measurement and Mensuration", "Time, Money and Unitary Method", "Data Handling"],
  5: ["Large Numbers", "Fundamental Operations", "Factors, Multiples and Integers", "Fractions and Decimals", "Percentage", "Geometry", "Mensuration", "Data Handling"],
  6: ["Sets", "Whole Numbers and Integers", "Fractions and Decimals", "Ratio, Proportion and Percentage", "Profit, Loss and Unitary Method", "Algebra", "Geometry", "Mensuration", "Statistics"],
  7: ["Sets", "Integers and Rational Numbers", "Ratio and Proportion", "Profit, Loss and Interest", "Algebraic Expressions", "Equations", "Geometry", "Mensuration", "Statistics and Probability"],
  8: ["Sets and Cardinality", "Profit, Loss, Discount and VAT", "Ratio, Proportion and Interest", "Algebraic Factorization", "Linear Equations", "Geometry", "Mensuration", "Statistics", "Probability"],
  9: ["Sets", "Tax and Household Arithmetic", "Mensuration", "Algebra", "Linear Equations", "Geometry", "Trigonometry", "Statistics", "Probability"],
  10: ["Sets", "Compound Interest and Growth", "Currency and Exchange", "Mensuration", "Algebraic Equations", "Quadratic Equations", "Arithmetic Progression", "Geometry", "Trigonometry", "Statistics", "Probability"],
  11: ["Logic and Sets", "Real and Complex Numbers", "Functions", "Sequences and Series", "Matrices and Determinants", "Analytic Geometry", "Trigonometry", "Vectors", "Statistics and Probability", "Limits and Derivatives"],
  12: ["Algebra", "Matrices", "Analytic Geometry", "Trigonometry", "Vectors", "Statistics", "Probability", "Continuity and Differentiation", "Integration", "Differential Equations", "Numerical Methods"],
};

const ENGLISH_CHAPTERS = ["Reading Comprehension", "Vocabulary", "Grammar in Context", "Listening and Speaking", "Guided Writing", "Creative and Functional Writing", "Literature and Response"];
const NEPALI_CHAPTERS = ["पठनबोध", "शब्दभण्डार", "व्याकरण", "सुनाइ र बोलाइ", "व्यावहारिक लेखन", "कथा, कविता र निबन्ध", "सिर्जनात्मक अभिव्यक्ति"];
const SOCIAL_CHAPTERS = ["Self, Family and Society", "Civic Awareness and Human Values", "Nepal: Geography and Environment", "Nepal: History and Culture", "Economic Activities", "Constitution, Rights and Duties", "Global Relations and Contemporary Issues"];
const HEALTH_CHAPTERS = ["Personal Health and Hygiene", "Nutrition", "Physical Exercise and Games", "Safety and First Aid", "Adolescent and Reproductive Health", "Creative Arts", "Community Health and Environment"];
const INTEGRATED_SCIENCE = ["My Body and Healthy Habits", "Family and Community", "Plants Around Us", "Animals Around Us", "Air, Water and Weather", "Our Earth and Sky", "Safety and Technology"];

const SCIENCE_CHAPTERS: Record<number, string[]> = {
  4: ["Scientific Learning", "Living Things", "Life Processes", "Matter", "Force and Motion", "Energy", "Earth and Space", "Environment and Technology"],
  5: ["Scientific Investigation", "Classification of Living Things", "Human Body and Health", "Matter and Materials", "Force, Work and Energy", "Electricity and Magnetism", "Earth, Space and Environment", "Information Technology"],
  6: ["Scientific Measurement", "Living Organisms and Cells", "Life Processes", "Matter and Mixtures", "Force and Motion", "Energy", "Electricity and Magnetism", "Earth and Space", "Environment and Technology"],
  7: ["Scientific Learning", "Cell and Classification", "Life Processes", "Matter", "Force and Motion", "Heat and Light", "Electricity and Magnetism", "Earth and Space", "Environment and ICT"],
  8: ["Measurement", "Force and Pressure", "Work, Energy and Power", "Heat and Light", "Electricity", "Matter and Chemical Change", "Cell and Life Processes", "Earth and Space", "Environment and Technology"],
  9: ["Scientific Measurement", "Classification of Living Beings", "Life Processes", "Force and Motion", "Machines", "Energy", "Electricity and Magnetism", "Matter and Chemical Reactions", "Earth and Space", "Environment and ICT"],
  10: ["Scientific Measurement", "Force and Motion", "Energy", "Electricity and Magnetism", "Waves", "Chemical Reactions", "Periodic Classification", "Metals and Non-metals", "Human Body Systems", "Heredity", "Environment", "Astronomy"],
};

function subjectCode(prefix: string, grade: number, order: number): string {
  return `${prefix}-${grade}${String(order).padStart(2, "0")}`;
}

function subjectsForGrade(grade: number): CDCSubjectCatalogItem[] {
  const math: CDCSubjectCatalogItem = { key: "math", code: grade === 8 ? "MTH-801" : subjectCode("MTH", grade, 1), name: "Compulsory Mathematics", nameNepali: "अनिवार्य गणित", chapters: MATHEMATICS_CHAPTERS[grade] };
  const english: CDCSubjectCatalogItem = { key: "english", code: grade === 8 ? "ENG-803" : subjectCode("ENG", grade, 2), name: "English", nameNepali: "अंग्रेजी", chapters: ENGLISH_CHAPTERS };
  const nepali: CDCSubjectCatalogItem = { key: "nepali", code: grade === 8 ? "NEP-804" : subjectCode("NEP", grade, 3), name: "Nepali", nameNepali: "नेपाली", chapters: NEPALI_CHAPTERS };
  const social: CDCSubjectCatalogItem = { key: "social", code: grade === 8 ? "SOC-805" : subjectCode("SOC", grade, 4), name: grade >= 11 ? "Social Studies & Life Skills" : "Social Studies & Human Values", nameNepali: grade >= 11 ? "सामाजिक अध्ययन तथा जीवनोपयोगी शिक्षा" : "सामाजिक अध्ययन तथा मानव मूल्य", chapters: SOCIAL_CHAPTERS };
  if (grade <= 3) {
    return [nepali, english, math, { key: "science", code: subjectCode("SER", grade, 4), name: "Our Surroundings (Integrated)", nameNepali: "हाम्रो सेरोफेरो", chapters: INTEGRATED_SCIENCE }];
  }
  if (grade >= 11) return [nepali, english, social, math];
  const science: CDCSubjectCatalogItem = { key: "science", code: grade === 8 ? "SCI-802" : subjectCode("SCI", grade, 5), name: "Science & Technology", nameNepali: "विज्ञान तथा प्रविधि", chapters: SCIENCE_CHAPTERS[grade] || INTEGRATED_SCIENCE };
  const health: CDCSubjectCatalogItem = { key: "health", code: subjectCode("HPE", grade, 6), name: "Health, Physical Education & Creative Arts", nameNepali: "स्वास्थ्य, शारीरिक शिक्षा तथा सिर्जनात्मक कला", chapters: HEALTH_CHAPTERS };
  return [nepali, english, math, science, social, health];
}

export const CDC_COMPULSORY_CATALOG: CDCGradeCatalogItem[] = Array.from({ length: 12 }, (_, index) => {
  const grade = index + 1;
  const source = grade <= 3 ? OFFICIAL_SOURCES.primary : grade <= 5 ? OFFICIAL_SOURCES.grade45 : grade <= 8 ? OFFICIAL_SOURCES.grade68 : grade <= 10 ? OFFICIAL_SOURCES.grade910 : OFFICIAL_SOURCES.grade1112;
  return {
    code: `class-${grade}` as CDCClassCode,
    name: `Class ${grade}`,
    level: grade <= 8 ? "Basic Level" : "Secondary Level",
    sourceTitle: source.title,
    sourceUrl: source.url,
    catalogStatus: "OFFICIAL_FRAMEWORK_SCAFFOLD",
    subjects: subjectsForGrade(grade),
  };
});

export function getCDCGradeCatalog(gradeName: string): CDCGradeCatalogItem {
  return CDC_COMPULSORY_CATALOG.find((grade) => grade.name === gradeName) || CDC_COMPULSORY_CATALOG[7];
}
