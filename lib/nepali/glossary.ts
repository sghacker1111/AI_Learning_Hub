import { GlossaryTerm } from "./types";

export const CDC_BILINGUAL_GLOSSARY: GlossaryTerm[] = [
  // MATHEMATICS: SETS
  {
    id: "mth-set",
    english: "Set",
    nepali: "समूह",
    romanized: "Samuha",
    subject: "Mathematics",
    gradeLevel: "Class 6-10",
    definitionEnglish: "A well-defined collection of distinct objects or elements.",
    definitionNepali: "सुपरिभाषित वस्तु वा सदस्यहरूको सङ्ग्रहलाई समूह भनिन्छ।",
    formulaOrSymbol: "A = \\{x : x \\in \\mathbb{N}\\}",
    exampleEnglish: "Set of vowels: V = {a, e, i, o, u}",
    exampleNepali: "नेपाली स्वरवर्णहरूको समूह: {अ, आ, इ, ई...}",
  },
  {
    id: "mth-cardinality",
    english: "Cardinality",
    nepali: "गणना संख्या / गणनात्मकता",
    romanized: "Gananatmakta",
    subject: "Mathematics",
    gradeLevel: "Class 6-10",
    definitionEnglish: "The total number of distinct elements present in a set.",
    definitionNepali: "कुनै समूहमा रहेका फरक सदस्यहरूको जम्मा संख्या।",
    formulaOrSymbol: "n(A)",
    exampleEnglish: "If A = {2, 4, 6}, then n(A) = 3",
    exampleNepali: "यदि A = {२, ४, ६} भए, n(A) = ३",
  },
  {
    id: "mth-union",
    english: "Union of Sets",
    nepali: "समूहको संयोजन",
    romanized: "Samuha ko Samyojan",
    subject: "Mathematics",
    gradeLevel: "Class 7-10",
    definitionEnglish: "A set containing all elements that belong to set A, set B, or both.",
    definitionNepali: "समूह A वा समूह B वा दुवैमा पर्ने सबै सदस्यहरू मिलेर बनेको समूह।",
    formulaOrSymbol: "A \\cup B",
    exampleEnglish: "A = {1, 2}, B = {2, 3} => A ∪ B = {1, 2, 3}",
    exampleNepali: "A = {१, २}, B = {२, ३} => A ∪ B = {१, २, ३}",
  },
  {
    id: "mth-intersection",
    english: "Intersection of Sets",
    nepali: "समूहको प्रतिच्छेदन",
    romanized: "Samuha ko Pratichhedan",
    subject: "Mathematics",
    gradeLevel: "Class 7-10",
    definitionEnglish: "A set containing only the common elements present in both set A and set B.",
    definitionNepali: "समूह A र समूह B दुवैमा साझा रहेका सदस्यहरूको समूह।",
    formulaOrSymbol: "A \\cap B",
    exampleEnglish: "A = {1, 2}, B = {2, 3} => A ∩ B = {2}",
    exampleNepali: "A = {१, २}, B = {२, ३} => A ∩ B = {२}",
  },
  {
    id: "mth-universal",
    english: "Universal Set",
    nepali: "सर्वव्यापक समूह",
    romanized: "Sarvabyapak Samuha",
    subject: "Mathematics",
    gradeLevel: "Class 7-10",
    definitionEnglish: "A set containing all possible elements under consideration in a given problem context.",
    definitionNepali: "दिइएको सन्दर्भमा विचार गर्न सकिने सबै सदस्यहरू समावेश भएको समूह।",
    formulaOrSymbol: "U",
  },
  {
    id: "mth-complement",
    english: "Complement of a Set",
    nepali: "पूरक समूह",
    romanized: "Poorak Samuha",
    subject: "Mathematics",
    gradeLevel: "Class 8-10",
    definitionEnglish: "The set of all elements in universal set U that do not belong to set A.",
    definitionNepali: "सर्वव्यापक समूह U का ती सदस्यहरू जो समूह A मा पर्दैनन्।",
    formulaOrSymbol: "A' = U - A",
  },
  {
    id: "mth-overlapping",
    english: "Overlapping Sets",
    nepali: "खप्टिएका समूहहरू",
    romanized: "Khaptieka Samuhaharu",
    subject: "Mathematics",
    gradeLevel: "Class 8-10",
    definitionEnglish: "Sets having at least one common element in their intersection.",
    definitionNepali: "कम्तीमा एउटा सदस्य साझा भएका समूहहरू (n(A ∩ B) ≠ ∅)।",
    formulaOrSymbol: "n(A \\cap B) > 0",
  },
  {
    id: "mth-disjoint",
    english: "Disjoint Sets",
    nepali: "अलगिएका समूहहरू",
    romanized: "Alagieka Samuhaharu",
    subject: "Mathematics",
    gradeLevel: "Class 7-10",
    definitionEnglish: "Sets having no common elements at all.",
    definitionNepali: "कुनै पनि सदस्य साझा नभएका समूहहरू (A ∩ B = ∅)।",
    formulaOrSymbol: "A \\cap B = \\emptyset",
  },

  // ARITHMETIC & CONSUMER MATH
  {
    id: "mth-mp",
    english: "Marked Price",
    nepali: "अंकित मूल्य",
    romanized: "Ankit Mulya",
    subject: "Mathematics",
    gradeLevel: "Class 8-10",
    definitionEnglish: "The list or printed price of an item before discount.",
    definitionNepali: "सामानमा तोकिएको वा लेखिएको मूल्य।",
    formulaOrSymbol: "\\text{MP}",
  },
  {
    id: "mth-discount",
    english: "Discount",
    nepali: "छुट",
    romanized: "Chhut",
    subject: "Mathematics",
    gradeLevel: "Class 7-10",
    definitionEnglish: "The reduction in marked price offered to the customer.",
    definitionNepali: "अंकित मूल्यमा ग्राहकलाई घटाएर दिइने रकम।",
    formulaOrSymbol: "\\text{Discount} = \\text{MP} \\times \\frac{D\\%}{100}",
  },
  {
    id: "mth-vat",
    english: "Value Added Tax (VAT)",
    nepali: "मूल्य अभिवृद्धि कर (मू.अ.कर)",
    romanized: "Mulya Abhibriddhi Kar",
    subject: "Mathematics",
    gradeLevel: "Class 8-10",
    definitionEnglish: "Indirect consumption tax levied by the Government of Nepal (standard rate: 13%).",
    definitionNepali: "नेपाल सरकारद्वारा सामान वा सेवाको बिक्री मूल्यमा लगाइने १३% कर।",
    formulaOrSymbol: "\\text{VAT Amount} = \\text{SP} \\times 0.13",
  },

  // SCIENCE: FORCE & PRESSURE
  {
    id: "sci-pressure",
    english: "Pressure",
    nepali: "चाप",
    romanized: "Chaap",
    subject: "Science",
    gradeLevel: "Class 8-10",
    definitionEnglish: "Perpendicular force applied per unit area.",
    definitionNepali: "एकाइ क्षेत्रफलमा लम्ब रूपले पर्ने बललाई चाप भनिन्छ।",
    formulaOrSymbol: "P = \\frac{F}{A}",
    exampleEnglish: "Unit: Pascal (Pa) or N/m²",
    exampleNepali: "एकाइ: पास्कल (Pa) वा N/m²",
  },
  {
    id: "sci-upthrust",
    english: "Upthrust / Buoyant Force",
    nepali: "उर्ध्वचाप",
    romanized: "Urdhwachap",
    subject: "Science",
    gradeLevel: "Class 8-10",
    definitionEnglish: "The upward resultant force exerted by a fluid on an immersed body.",
    definitionNepali: "कुनै वस्तुलाई तरल पदार्थमा डुबाउँदा तरलले वस्तुमा माथितिर दिने लम्ब बल।",
    formulaOrSymbol: "U = V \\cdot d \\cdot g",
  },
  {
    id: "sci-density",
    english: "Density",
    nepali: "घनत्व",
    romanized: "Ghanatwa",
    subject: "Science",
    gradeLevel: "Class 7-10",
    definitionEnglish: "Mass of a substance per unit volume.",
    definitionNepali: "कुनै पदार्थको प्रति एकाइ आयतनको पिण्डलाई घनत्व भनिन्छ।",
    formulaOrSymbol: "d = \\frac{m}{V}",
  },
  {
    id: "sci-archimedes",
    english: "Archimedes' Principle",
    nepali: "आर्किमिडिजको सिद्धान्त",
    romanized: "Archimedes ko Siddhanta",
    subject: "Science",
    gradeLevel: "Class 8-10",
    definitionEnglish: "When a body is partially or fully immersed in a liquid, it experiences an upthrust equal to the weight of displaced liquid.",
    definitionNepali: "कुनै वस्तुलाई तरलमा पूर्ण वा आंशिक रूपमा डुबाउँदा विस्थापित तरलको तौल बराबरको उर्ध्वचाप लाग्छ।",
    formulaOrSymbol: "U = W_{\\text{displaced fluid}}",
  },
  {
    id: "sci-flotation",
    english: "Law of Flotation",
    nepali: "प्लवनको नियम",
    romanized: "Plawan ko Niyam",
    subject: "Science",
    gradeLevel: "Class 8-10",
    definitionEnglish: "A floating body displaces its own weight of the fluid in which it floats.",
    definitionNepali: "उत्रने वस्तुले आफ्नो तौल बराबरको तरल पदार्थ विस्थापित गर्दछ।",
    formulaOrSymbol: "W_{\\text{object}} = W_{\\text{displaced fluid}}",
  },
  {
    id: "sci-atmospheric",
    english: "Atmospheric Pressure",
    nepali: "वायुमण्डलीय चाप",
    romanized: "Bayumandaliya Chaap",
    subject: "Science",
    gradeLevel: "Class 8-10",
    definitionEnglish: "The pressure exerted by the weight of the Earth's atmosphere on surfaces.",
    definitionNepali: "पृथ्वीको वायुमण्डलले आफ्नो तौलका कारण पृथ्वीको सतहमा दिने चाप।",
    formulaOrSymbol: "1 \\text{ atm} = 760 \\text{ mm of Hg} = 1.013 \\times 10^5 \\text{ Pa}",
  },
];

/**
 * Fuzzy search CDC terms across English, Devanagari, and Romanized spellings.
 */
export function searchGlossary(query: string, subjectFilter?: string): GlossaryTerm[] {
  const clean = query.toLowerCase().trim();
  let results = CDC_BILINGUAL_GLOSSARY;

  if (subjectFilter && subjectFilter !== "ALL") {
    results = results.filter((term) => term.subject.toLowerCase() === subjectFilter.toLowerCase());
  }

  if (!clean) return results;

  return results.filter(
    (term) =>
      term.english.toLowerCase().includes(clean) ||
      term.nepali.includes(clean) ||
      term.romanized.toLowerCase().includes(clean) ||
      term.definitionEnglish.toLowerCase().includes(clean) ||
      term.definitionNepali.includes(clean)
  );
}
