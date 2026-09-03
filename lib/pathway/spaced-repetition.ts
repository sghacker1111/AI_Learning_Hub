import { SpacedReviewCard } from "./types";

export function generateSpacedRepetitionDeck(): SpacedReviewCard[] {
  return [
    {
      id: "sr-1",
      conceptTitle: "Cardinality of Two Overlapping Sets",
      conceptTitleNepali: "दुई खप्टिएका समूहहरूको गणना सूत्र",
      formulaLatex: "n(A \\cup B) = n(A) + n(B) - n(A \\cap B)",
      promptQuestion: "What must be subtracted when calculating the union of two overlapping sets?",
      quickAnswer: "The intersection n(A ∩ B) must be subtracted to prevent double counting.",
      lastReviewedDaysAgo: 3,
      retentionIntervalDays: 3,
      status: "DUE_TODAY",
    },
    {
      id: "sr-2",
      conceptTitle: "Nepal Value Added Tax (VAT) Calculation",
      conceptTitleNepali: "१३% मूल्य अभिवृद्धि कर (VAT)",
      formulaLatex: "\\text{VAT Amount} = \\text{SP (after discount)} \\times 0.13",
      promptQuestion: "Is VAT applied on Marked Price (MP) or Selling Price after discount (SP)?",
      quickAnswer: "VAT is strictly applied on the Selling Price (SP) after deducting discount.",
      lastReviewedDaysAgo: 1,
      retentionIntervalDays: 1,
      status: "DUE_TODAY",
    },
    {
      id: "sr-3",
      conceptTitle: "Archimedes' Buoyant Upthrust",
      conceptTitleNepali: "आर्किमिडिजको उर्ध्वचाप सूत्र",
      formulaLatex: "U = V \\cdot d \\cdot g",
      promptQuestion: "What does 'd' stand for in the upthrust formula U = V · d · g?",
      quickAnswer: "'d' is the density of the displaced liquid (kg/m³), NOT the object density.",
      lastReviewedDaysAgo: 7,
      retentionIntervalDays: 7,
      status: "DUE_TODAY",
    },
    {
      id: "sr-4",
      conceptTitle: "Liquid Pressure at Depth h",
      conceptTitleNepali: "तरल पदार्थको चाप",
      formulaLatex: "P = h \\cdot d \\cdot g",
      promptQuestion: "Does liquid pressure depend on the shape of the container?",
      quickAnswer: "No. Liquid pressure depends only on depth (h), density (d), and gravity (g).",
      lastReviewedDaysAgo: 14,
      retentionIntervalDays: 14,
      status: "MASTERED_STABLE",
    },
  ];
}
