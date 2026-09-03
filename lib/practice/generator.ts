import { CognitiveLevel, GeneratedQuestion } from "./types";

export function generateAdaptiveQuestion(
  subject: string = "Compulsory Mathematics",
  chapter: string = "Sets",
  level: CognitiveLevel = "LEVEL_2_UNDERSTANDING"
): GeneratedQuestion {
  const isVAT = chapter.toLowerCase().includes("vat") || chapter.toLowerCase().includes("arithmetic");
  const isSets =
    !isVAT &&
    (chapter.toLowerCase().includes("set") || subject.toLowerCase().includes("math"));


  // 1. CLASS 8 MATHEMATICS: SETS
  if (isSets) {
    if (level === "LEVEL_1_KNOWLEDGE") {
      return {
        id: `q-sets-l1-${Date.now()}`,
        grade: "Class 8",
        subject: "Compulsory Mathematics",
        chapter: "Unit 1: Sets",
        learningOutcomeCode: "LO-MTH801-1.1",
        cognitiveLevel: "LEVEL_1_KNOWLEDGE",
        difficultyLabel: "Easy",
        questionType: "MCQ",
        questionText: "If two sets A and B have no common elements (i.e. $A \\cap B = \\emptyset$), what are these sets called in the Nepal CDC curriculum?",
        options: [
          { id: "opt-1", text: "Overlapping Sets (खप्टिएका समूहहरू)", isCorrect: false },
          { id: "opt-2", text: "Disjoint Sets (अलगिएका समूहहरू)", isCorrect: true },
          { id: "opt-3", text: "Universal Sets (सर्वव्यापक समूहहरू)", isCorrect: false },
          { id: "opt-4", text: "Equal Sets (बराबर समूहहरू)", isCorrect: false },
        ],
        correctOptionId: "opt-2",
        explanationMarkdown: `**Explanation:**
According to Nepal CDC Class 8 Mathematics Unit 1, two sets having no elements in common ($A \\cap B = \\emptyset$) are called **Disjoint Sets (अलगिएका समूहहरू)**.`,
        marks: 1,
      };
    }

    if (level === "LEVEL_2_UNDERSTANDING") {
      const nA = 24;
      const nB = 18;
      const nInter = 8;
      const nUnion = nA + nB - nInter; // 34

      return {
        id: `q-sets-l2-${Date.now()}`,
        grade: "Class 8",
        subject: "Compulsory Mathematics",
        chapter: "Unit 1: Sets",
        learningOutcomeCode: "LO-MTH801-1.1",
        cognitiveLevel: "LEVEL_2_UNDERSTANDING",
        difficultyLabel: "Medium",
        questionType: "MCQ",
        questionText: `In two overlapping sets A and B, if $n(A) = ${nA}$, $n(B) = ${nB}$, and $n(A \\cap B) = ${nInter}$, what is the cardinality of their union $n(A \\cup B)$?`,
        latexEquation: "n(A \\cup B) = n(A) + n(B) - n(A \\cap B)",
        options: [
          { id: "opt-1", text: `${nUnion + 6}`, isCorrect: false },
          { id: "opt-2", text: `${nUnion}`, isCorrect: true },
          { id: "opt-3", text: `${nA + nB}`, isCorrect: false },
          { id: "opt-4", text: `${nUnion - 4}`, isCorrect: false },
        ],
        correctOptionId: "opt-2",
        explanationMarkdown: `**Step-by-Step CDC Solution:**
Using the cardinality theorem for two overlapping sets:
$$n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$$
$$n(A \\cup B) = ${nA} + ${nB} - ${nInter} = ${nA + nB} - ${nInter} = \\mathbf{${nUnion}}$$`,
        marks: 2,
      };
    }

    if (level === "LEVEL_3_APPLICATION") {
      return {
        id: `q-sets-l3-${Date.now()}`,
        grade: "Class 8",
        subject: "Compulsory Mathematics",
        chapter: "Unit 1: Sets",
        learningOutcomeCode: "LO-MTH801-1.2",
        cognitiveLevel: "LEVEL_3_APPLICATION",
        difficultyLabel: "Hard",
        questionType: "MCQ",
        questionText: "In a class survey of 60 students in Class 8, 35 students like Mathematics, 28 like Science, and 12 like both subjects. How many students like neither of the two subjects ($n(M \\cup S)'$)?",
        options: [
          { id: "opt-1", text: "5 students", isCorrect: false },
          { id: "opt-2", text: "9 students", isCorrect: true },
          { id: "opt-3", text: "14 students", isCorrect: false },
          { id: "opt-4", text: "18 students", isCorrect: false },
        ],
        correctOptionId: "opt-2",
        explanationMarkdown: `**Step-by-Step CDC Solution:**
1. Given: $n(U) = 60, n(M) = 35, n(S) = 28, n(M \\cap S) = 12$
2. Compute Total Union:
$$n(M \\cup S) = n(M) + n(S) - n(M \\cap S) = 35 + 28 - 12 = 51$$
3. Compute Complement (Neither subject):
$$n(M \\cup S)' = n(U) - n(M \\cup S) = 60 - 51 = \\mathbf{9 \\text{ students}}$$`,
        marks: 3,
      };
    }

    // LEVEL 4 HIGHER ABILITY
    return {
      id: `q-sets-l4-${Date.now()}`,
      grade: "Class 8",
      subject: "Compulsory Mathematics",
      chapter: "Unit 1: Sets",
      learningOutcomeCode: "LO-MTH801-1.3",
      cognitiveLevel: "LEVEL_4_HIGHER_ABILITY",
      difficultyLabel: "Challenging",
      questionType: "MCQ",
      questionText: "In a group of 100 students, the ratio of students who like only Football to only Volleyball is $3:2$. If 20 students like both sports and 10 students like neither sport, find the total number of students who like Football ($n(F)$).",
      options: [
        { id: "opt-1", text: "42 students", isCorrect: false },
        { id: "opt-2", text: "62 students", isCorrect: true },
        { id: "opt-3", text: "56 students", isCorrect: false },
        { id: "opt-4", text: "70 students", isCorrect: false },
      ],
      correctOptionId: "opt-2",
      explanationMarkdown: `**Step-by-Step CDC Solution:**
1. Let $n_o(F) = 3x$ and $n_o(V) = 2x$.
2. Given: $n(U) = 100, n(F \\cap V) = 20, n(F \\cup V)' = 10$.
3. Total equation:
$$n(U) = n_o(F) + n_o(V) + n(F \\cap V) + n(F \\cup V)'$$
$$100 = 3x + 2x + 20 + 10 \\implies 5x + 30 = 100 \\implies 5x = 70 \\implies x = 14$$
4. Therefore, $n_o(F) = 3(14) = 42$.
5. Total liking Football:
$$n(F) = n_o(F) + n(F \\cap V) = 42 + 20 = \\mathbf{62 \\text{ students}}$$`,
      marks: 4,
    };
  }

  // 2. CLASS 8 ARITHMETIC (13% VAT)
  if (isVAT) {
    if (level === "LEVEL_1_KNOWLEDGE") {
      return {
        id: `q-vat-l1-${Date.now()}`,
        grade: "Class 8",
        subject: "Compulsory Mathematics",
        chapter: "Unit 2: Arithmetic",
        learningOutcomeCode: "LO-MTH801-2.1",
        cognitiveLevel: "LEVEL_1_KNOWLEDGE",
        difficultyLabel: "Easy",
        questionType: "MCQ",
        questionText: "What is the standard Value Added Tax (VAT) rate prescribed by the Government of Nepal in commercial sales?",
        options: [
          { id: "opt-1", text: "10%", isCorrect: false },
          { id: "opt-2", text: "13%", isCorrect: true },
          { id: "opt-3", text: "15%", isCorrect: false },
          { id: "opt-4", text: "18%", isCorrect: false },
        ],
        correctOptionId: "opt-2",
        explanationMarkdown: `**Explanation:**
Under the Nepal Value Added Tax Act, the standard VAT rate applied to goods and services is **13%**.`,
        marks: 1,
      };
    }

    return {
      id: `q-vat-l2-${Date.now()}`,
      grade: "Class 8",
      subject: "Compulsory Mathematics",
      chapter: "Unit 2: Arithmetic",
      learningOutcomeCode: "LO-MTH801-2.2",
      cognitiveLevel: "LEVEL_2_UNDERSTANDING",
      difficultyLabel: "Medium",
      questionType: "MCQ",
      questionText: "The marked price of a bag is Rs. 2,000. If a 10% discount is allowed followed by 13% VAT, calculate the final selling price paid by the customer.",
      options: [
        { id: "opt-1", text: "Rs. 1,980.00", isCorrect: false },
        { id: "opt-2", text: "Rs. 2,034.00", isCorrect: true },
        { id: "opt-3", text: "Rs. 2,120.00", isCorrect: false },
        { id: "opt-4", text: "Rs. 1,890.00", isCorrect: false },
      ],
      correctOptionId: "opt-2",
      explanationMarkdown: `**Step-by-Step CDC Solution:**
1. Discount = $2000 \\times 10\\% = \\text{Rs. } 200$
2. SP without VAT = $2000 - 200 = \\text{Rs. } 1800$
3. 13% VAT = $1800 \\times 0.13 = \\text{Rs. } 234$
4. Final SP with VAT = $1800 + 234 = \\mathbf{\\text{Rs. } 2,034.00}$`,
      marks: 2,
    };
  }

  // 3. CLASS 8 SCIENCE: FORCE & PRESSURE
  if (level === "LEVEL_1_KNOWLEDGE") {
    return {
      id: `q-sci-l1-${Date.now()}`,
      grade: "Class 8",
      subject: "Science & Technology",
      chapter: "Unit 2: Force & Pressure",
      learningOutcomeCode: "LO-SCI802-2.1",
      cognitiveLevel: "LEVEL_1_KNOWLEDGE",
      difficultyLabel: "Easy",
      questionType: "MCQ",
      questionText: "Which formula correctly represents the liquid pressure ($P$) at depth $h$ in a liquid of density $d$ under gravity $g$?",
      options: [
        { id: "opt-1", text: "$P = \\frac{h}{d \\cdot g}$", isCorrect: false },
        { id: "opt-2", text: "$P = h \\cdot d \\cdot g$", isCorrect: true },
        { id: "opt-3", text: "$P = \\frac{F}{d}$", isCorrect: false },
        { id: "opt-4", text: "$P = V \\cdot d \\cdot g$", isCorrect: false },
      ],
      correctOptionId: "opt-2",
      explanationMarkdown: `**Explanation:**
Liquid pressure at depth $h$ is given by $$P = h \\cdot d \\cdot g$$ where $h$ is depth, $d$ is density, and $g$ is acceleration due to gravity.`,
      marks: 1,
    };
  }

  return {
    id: `q-sci-l2-${Date.now()}`,
    grade: "Class 8",
    subject: "Science & Technology",
    chapter: "Unit 2: Force & Pressure",
    learningOutcomeCode: "LO-SCI802-2.2",
    cognitiveLevel: "LEVEL_2_UNDERSTANDING",
    difficultyLabel: "Medium",
    questionType: "MCQ",
    questionText: "An object weighs 40 N in air. When completely immersed in water, it displaces $0.0015\\text{ m}^3$ of water ($d = 1000\\text{ kg/m}^3, g = 9.8\\text{ m/s}^2$). What is the upthrust ($U$) experienced by the object?",
    options: [
      { id: "opt-1", text: "12.5 N", isCorrect: false },
      { id: "opt-2", text: "14.7 N", isCorrect: true },
      { id: "opt-3", text: "25.3 N", isCorrect: false },
      { id: "opt-4", text: "30.0 N", isCorrect: false },
    ],
    correctOptionId: "opt-2",
    explanationMarkdown: `**Step-by-Step CDC Solution:**
Using Archimedes' Upthrust formula:
$$U = V \\cdot d \\cdot g = 0.0015 \\times 1000 \\times 9.8 = \\mathbf{14.7 \\text{ N}}$$
Apparent weight in water would be: $40 - 14.7 = 25.3\\text{ N}$.`,
    marks: 2,
  };
}
