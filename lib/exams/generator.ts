import { ExamPaper } from "./types";
import { CDC_SPECIFICATION_GRIDS } from "./specification-grid";

export function generateExamPaper(
  examKey: string = "ble_class_8_math",
  customOptions?: {
    title?: string;
    grade?: string;
    subject?: string;
    durationMinutes?: number;
  }
): ExamPaper {
  if (examKey !== "ble_class_8_math" && examKey !== "unit_test_math_sets_vat") {
    throw new Error("Unknown exam key: " + examKey);
  }

  if (examKey === "unit_test_math_sets_vat") {
    const grid = CDC_SPECIFICATION_GRIDS.unit_test_math_sets_vat;
    const requestedDuration = customOptions?.durationMinutes;
    const durationMinutes = Number.isFinite(requestedDuration)
      ? Math.min(300, Math.max(5, Math.round(requestedDuration!)))
      : grid.durationMinutes;
    return {
      id: "exam-ut1-mth801",
      title: customOptions?.title?.trim().slice(0, 120) || "Class 8 Mathematics: Unit Test 1 (Sets & 13% VAT)",
      titleNepali: "कक्षा ८ अनिवार्य गणित: एकाइ परीक्षा १ (समूह र १३% भ्याट)",
      examType: "UNIT_TEST",
      grade: "Class 8",
      subject: "Compulsory Mathematics",
      subjectCode: "MTH-801",
      fullMarks: grid.fullMarks,
      passMarks: grid.passMarks,
      timeDurationMinutes: durationMinutes,
      instructionsEnglish: [
        "All questions are compulsory.",
        "Show all intermediate calculation steps clearly for full credit.",
        "Use of standard non-programmable calculator is permitted.",
      ],
      instructionsNepali: [
        "सबै प्रश्नहरू अनिवार्य छन्।",
        "पूरा अंक प्राप्त गर्न सबै गणनाका चरणहरू प्रष्ट देखाउनुहोस्।",
      ],
      groups: [
        {
          group: "GROUP_A",
          groupTitle: "Group A (Very Short Questions - 1 Mark Each)",
          groupTitleNepali: "समूह 'क' (१ अंक दरका अति संक्षिप्त प्रश्नहरू)",
          marksPerQuestion: 1,
          questionCount: 2,
          totalGroupMarks: 2,
          questions: [
            {
              id: "q-ut-1",
              questionNumber: 1,
              group: "GROUP_A",
              marks: 1,
              cognitiveLevel: "Knowledge",
              learningOutcomeCode: "LO-MTH801-1.1",
              questionEnglish: "Write the formula for the cardinality of the union of two overlapping sets A and B ($n(A \\cup B)$).",
              questionNepali: "दुई खप्टिएका समूहहरू A र B को संयोजनको गणना संख्या ($n(A \\cup B)$) निकाल्ने सूत्र लेख्नुहोस्।",
              latexFormula: "n(A \\cup B) = ?",
              options: [
                { id: "opt-1", text: "n(A ∪ B) = n(A) + n(B)", isCorrect: false },
                { id: "opt-2", text: "n(A ∪ B) = n(A) + n(B) - n(A ∩ B)", isCorrect: true },
                { id: "opt-3", text: "n(A ∪ B) = n(A) - n(B)", isCorrect: false },
                { id: "opt-4", text: "n(A ∪ B) = n(U) - n(A ∩ B)", isCorrect: false },
              ],
              correctOptionId: "opt-2",
              modelAnswerMarkdown: "$$n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$$",
              markingSchemeSteps: [
                { stepDescription: "Writing correct formula with intersection subtraction", marks: 1 },
              ],
            },
            {
              id: "q-ut-2",
              questionNumber: 2,
              group: "GROUP_A",
              marks: 1,
              cognitiveLevel: "Knowledge",
              learningOutcomeCode: "LO-MTH801-2.1",
              questionEnglish: "What is the standard Value Added Tax (VAT) rate in Nepal?",
              questionNepali: "नेपालमा मूल्य अभिवृद्धि कर (VAT) को प्रचलित दर कति प्रतिशत छ?",
              options: [
                { id: "opt-1", text: "10%", isCorrect: false },
                { id: "opt-2", text: "13%", isCorrect: true },
                { id: "opt-3", text: "15%", isCorrect: false },
                { id: "opt-4", text: "5%", isCorrect: false },
              ],
              correctOptionId: "opt-2",
              modelAnswerMarkdown: "The standard VAT rate in Nepal is **13%**.",
              markingSchemeSteps: [
                { stepDescription: "Stating 13%", marks: 1 },
              ],
            },
          ],
        },
        {
          group: "GROUP_B",
          groupTitle: "Group B (Short Questions - 2 Marks Each)",
          groupTitleNepali: "समूह 'ख' (२ अंक दरका संक्षिप्त प्रश्नहरू)",
          marksPerQuestion: 2,
          questionCount: 3,
          totalGroupMarks: 6,
          questions: [
            {
              id: "q-ut-3",
              questionNumber: 3,
              group: "GROUP_B",
              marks: 2,
              cognitiveLevel: "Understanding",
              learningOutcomeCode: "LO-MTH801-1.1",
              questionEnglish: "If $n(A) = 35$, $n(B) = 28$, and $n(A \\cap B) = 12$, calculate $n_o(A)$ and $n(A \\cup B)$.",
              questionNepali: "यदि $n(A) = ३५$, $n(B) = २८$, र $n(A \\cap B) = १२$ भए, $n_o(A)$ र $n(A \\cup B)$ को मान पत्ता लगाउनुहोस्।",
              options: [
                { id: "opt-1", text: "n_o(A) = 23, n(A ∪ B) = 51", isCorrect: true },
                { id: "opt-2", text: "n_o(A) = 20, n(A ∪ B) = 63", isCorrect: false },
                { id: "opt-3", text: "n_o(A) = 23, n(A ∪ B) = 48", isCorrect: false },
                { id: "opt-4", text: "n_o(A) = 16, n(A ∪ B) = 51", isCorrect: false },
              ],
              correctOptionId: "opt-1",
              modelAnswerMarkdown: `1. $n_o(A) = n(A) - n(A \\cap B) = 35 - 12 = 23$
2. $n(A \\cup B) = n(A) + n(B) - n(A \\cap B) = 35 + 28 - 12 = 51$`,
              markingSchemeSteps: [
                { stepDescription: "Calculation of n_o(A) = 23", marks: 1 },
                { stepDescription: "Calculation of n(A ∪ B) = 51", marks: 1 },
              ],
            },
            {
              id: "q-ut-4",
              questionNumber: 4,
              group: "GROUP_B",
              marks: 2,
              cognitiveLevel: "Understanding",
              learningOutcomeCode: "LO-MTH801-2.2",
              questionEnglish: "The marked price of a book is Rs. 800. If a 15% discount is allowed, find the selling price of the book.",
              questionNepali: "एउटा किताबको अंकित मूल्य रु. ८०० छ। यदि १५% छुट दिइयो भने उक्त किताबको बिक्री मूल्य कति हुन्छ?",
              options: [
                { id: "opt-1", text: "Rs. 680.00", isCorrect: true },
                { id: "opt-2", text: "Rs. 720.00", isCorrect: false },
                { id: "opt-3", text: "Rs. 650.00", isCorrect: false },
                { id: "opt-4", text: "Rs. 700.00", isCorrect: false },
              ],
              correctOptionId: "opt-1",
              modelAnswerMarkdown: `1. $\\text{Discount Amount} = 800 \\times 0.15 = \\text{Rs. } 120$
2. $\\text{SP} = 800 - 120 = \\text{Rs. } 680$`,
              markingSchemeSteps: [
                { stepDescription: "Discount calculation = Rs. 120", marks: 1 },
                { stepDescription: "Final SP = Rs. 680", marks: 1 },
              ],
            },
            {
              id: "q-ut-5",
              questionNumber: 5,
              group: "GROUP_B",
              marks: 2,
              cognitiveLevel: "Understanding",
              learningOutcomeCode: "LO-MTH801-2.2",
              questionEnglish: "If the selling price of a jacket before VAT is Rs. 3,500, calculate the 13% VAT amount and the total price with VAT.",
              questionNepali: "यदि भ्याट बाहेकको ज्याकेटको मूल्य रु. ३,५०० छ भने १३% भ्याट रकम र भ्याट सहितको जम्मा मूल्य निकाल्नुहोस्।",
              options: [
                { id: "opt-1", text: "VAT = Rs. 455, Total = Rs. 3,955", isCorrect: true },
                { id: "opt-2", text: "VAT = Rs. 420, Total = Rs. 3,920", isCorrect: false },
                { id: "opt-3", text: "VAT = Rs. 500, Total = Rs. 4,000", isCorrect: false },
                { id: "opt-4", text: "VAT = Rs. 455, Total = Rs. 4,055", isCorrect: false },
              ],
              correctOptionId: "opt-1",
              modelAnswerMarkdown: `1. $\\text{VAT Amount} = 3500 \\times 0.13 = \\text{Rs. } 455$
2. $\\text{Total with VAT} = 3500 + 455 = \\text{Rs. } 3,955$`,
              markingSchemeSteps: [
                { stepDescription: "VAT calculation = Rs. 455", marks: 1 },
                { stepDescription: "Total SP with VAT = Rs. 3,955", marks: 1 },
              ],
            },
          ],
        },
        {
          group: "GROUP_C",
          groupTitle: "Group C (Long Questions - 4 Marks Each)",
          groupTitleNepali: "समूह 'ग' (४ अंक दरका लामो प्रश्नहरू)",
          marksPerQuestion: 4,
          questionCount: 3,
          totalGroupMarks: 12,
          questions: [
            {
              id: "q-ut-6",
              questionNumber: 6,
              group: "GROUP_C",
              marks: 4,
              cognitiveLevel: "Application",
              learningOutcomeCode: "LO-MTH801-1.2",
              questionEnglish: "In a class of 50 students, 30 like tea, 25 like coffee, and 10 like both drinks. (i) Represent the information in a Venn diagram. (ii) Find how many students like neither drink.",
              questionNepali: "५० जना विद्यार्थीहरू भएको कक्षामा ३० जनालाई चिया, २५ जनालाई कफी र १० जनालाई दुवै मन पर्छ। (क) यो जानकारीलाई भेनचित्रमा प्रस्तुत गर्नुहोस्। (ख) दुवै पेय पदार्थ मन नपर्ने विद्यार्थी संख्या पत्ता लगाउनुहोस्।",
              options: [
                { id: "opt-1", text: "(ii) 5 students", isCorrect: true },
                { id: "opt-2", text: "(ii) 8 students", isCorrect: false },
                { id: "opt-3", text: "(ii) 12 students", isCorrect: false },
                { id: "opt-4", text: "(ii) 15 students", isCorrect: false },
              ],
              correctOptionId: "opt-1",
              modelAnswerMarkdown: `1. Given: $n(U) = 50, n(T) = 30, n(C) = 25, n(T \\cap C) = 10$.
2. Union: $n(T \\cup C) = n(T) + n(C) - n(T \\cap C) = 30 + 25 - 10 = 45$.
3. Neither: $n(T \\cup C)' = n(U) - n(T \\cup C) = 50 - 45 = \\mathbf{5 \\text{ students}}$.`,
              markingSchemeSteps: [
                { stepDescription: "Correct formula substitution for union", marks: 1.5 },
                { stepDescription: "Correct calculation of complement n(T ∪ C)' = 5", marks: 1.5 },
                { stepDescription: "Correct representation in Venn diagram", marks: 1.0 },
              ],
            },
            {
              id: "q-ut-7",
              questionNumber: 7,
              group: "GROUP_C",
              marks: 4,
              cognitiveLevel: "Application",
              learningOutcomeCode: "LO-MTH801-2.2",
              questionEnglish: "The marked price of an electric heater is Rs. 4,500. A shopkeeper allows a 10% discount and levies 13% VAT. If a customer pays with a Rs. 5,000 banknote, how much change should they receive?",
              questionNepali: "एउटा विद्युतीय हिटरको अंकित मूल्य रु. ४,५०० छ। पसलेले १०% छुट दिएर १३% भ्याट लगाउँछ। यदि कुनै ग्राहकले रु. ५,००० को नोट दियो भने कति फिर्ता पाउँछ?",
              options: [
                { id: "opt-1", text: "Rs. 423.50", isCorrect: true },
                { id: "opt-2", text: "Rs. 380.00", isCorrect: false },
                { id: "opt-3", text: "Rs. 450.00", isCorrect: false },
                { id: "opt-4", text: "Rs. 512.00", isCorrect: false },
              ],
              correctOptionId: "opt-1",
              modelAnswerMarkdown: `1. Discount Amount = $4500 \\times 0.10 = \\text{Rs. } 450$.
2. SP after discount = $4500 - 450 = \\text{Rs. } 4050$.
3. 13% VAT = $4050 \\times 0.13 = \\text{Rs. } 526.50$.
4. Final SP with VAT = $4050 + 526.50 = \\text{Rs. } 4576.50$.
5. Change to return = $5000 - 4576.50 = \\mathbf{\\text{Rs. } 423.50}$.`,
              markingSchemeSteps: [
                { stepDescription: "Calculation of SP after discount = Rs. 4050", marks: 1.0 },
                { stepDescription: "Calculation of 13% VAT = Rs. 526.50", marks: 1.0 },
                { stepDescription: "Total SP with VAT = Rs. 4576.50", marks: 1.0 },
                { stepDescription: "Change returned = Rs. 423.50", marks: 1.0 },
              ],
            },
            {
              id: "q-ut-8",
              questionNumber: 8,
              group: "GROUP_C",
              marks: 4,
              cognitiveLevel: "Higher Ability",
              learningOutcomeCode: "LO-MTH801-1.3",
              questionEnglish: "In a survey of 80 residents in a ward of Kathmandu, the ratio of people who read only Kantipur to only Gorkhapatra is 3:1. 15 people read both newspapers and 5 read neither. Find the total number of people who read Kantipur.",
              questionNepali: "काठमाडौँको एउटा वडाका ८० जना बासिन्दाहरूमा गरिएको सर्वेक्षणमा कान्तिपुर मात्र पढ्ने र गोरखापत्र मात्र पढ्नेको अनुपात ३:१ छ। १५ जनाले दुवै पत्रिका पढ्छन् र ५ जनाले कुनै पनि पढ्दैनन् भने कान्तिपुर पढ्ने जम्मा व्यक्ति संख्या निकाल्नुहोस्।",
              options: [
                { id: "opt-1", text: "60 people", isCorrect: true },
                { id: "opt-2", text: "45 people", isCorrect: false },
                { id: "opt-3", text: "55 people", isCorrect: false },
                { id: "opt-4", text: "65 people", isCorrect: false },
              ],
              correctOptionId: "opt-1",
              modelAnswerMarkdown: `1. Let $n_o(K) = 3x$ and $n_o(G) = x$.
2. Given: $n(U) = 80, n(K \\cap G) = 15, n(K \\cup G)' = 5$.
3. Total Equation: $80 = 3x + x + 15 + 5 \\implies 4x + 20 = 80 \\implies 4x = 60 \\implies x = 15$.
4. $n_o(K) = 3(15) = 45$.
5. Total reading Kantipur: $n(K) = n_o(K) + n(K \\cap G) = 45 + 15 = \\mathbf{60 \\text{ people}}$.`,
              markingSchemeSteps: [
                { stepDescription: "Setting up algebraic equation in x", marks: 1.5 },
                { stepDescription: "Solving x = 15 and n_o(K) = 45", marks: 1.5 },
                { stepDescription: "Total n(K) = 60", marks: 1.0 },
              ],
            },
          ],
        },
      ],
    };
  }

  // DEFAULT: CLASS 8 BLE PRACTICE MINI PAPER (16 MARKS)
  const defaultGrid = CDC_SPECIFICATION_GRIDS.ble_class_8_math;
  const requestedDuration = customOptions?.durationMinutes;
  const durationMinutes = Number.isFinite(requestedDuration)
    ? Math.min(300, Math.max(5, Math.round(requestedDuration!)))
    : defaultGrid.durationMinutes;
  return {
    id: "exam-ble-mth801",
    title: customOptions?.title?.trim().slice(0, 120) || "Class 8 BLE Practice Mini Paper — Mathematics",
    titleNepali: "कक्षा ८ आधारभूत तह परीक्षा (BLE) नमुना प्रश्नपत्र — अनिवार्य गणित",
    examType: "BLE",
    grade: customOptions?.grade || "Class 8",
    subject: customOptions?.subject || "Compulsory Mathematics",
    subjectCode: "MTH-801",
    fullMarks: 16,
    passMarks: 6,
    timeDurationMinutes: durationMinutes,
    instructionsEnglish: [
      "Attempt all questions in this demonstration practice paper.",
      "Figures in the margin indicate full marks.",
      "Calculators are allowed for arithmetic steps.",
    ],
    instructionsNepali: [
      "सबै प्रश्नहरूको उत्तर दिनुहोस्।",
      "दायाँ किनारामा दिइएका अंकले पूर्णाङ्क जनाउँछ।",
    ],
    groups: [
      {
        group: "GROUP_A",
        groupTitle: "Group A (Very Short Questions - 4 × 1 = 4 Marks)",
        groupTitleNepali: "समूह 'क' (४ × १ = ४ अंक)",
        marksPerQuestion: 1,
        questionCount: 4,
        totalGroupMarks: 4,
        questions: [
          {
            id: "q-ble-1",
            questionNumber: 1,
            group: "GROUP_A",
            marks: 1,
            cognitiveLevel: "Knowledge",
            learningOutcomeCode: "LO-MTH801-1.1",
            questionEnglish: "Define disjoint sets with a mathematical condition.",
            questionNepali: "अलगिएका समूहलाई गणितीय सर्त सहित परिभाषित गर्नुहोस्।",
            options: [
              { id: "opt-1", text: "A ∩ B = ∅", isCorrect: true },
              { id: "opt-2", text: "A ∪ B = U", isCorrect: false },
              { id: "opt-3", text: "A = B", isCorrect: false },
              { id: "opt-4", text: "n(A) = n(B)", isCorrect: false },
            ],
            correctOptionId: "opt-1",
            modelAnswerMarkdown: "Two sets A and B are disjoint if they share no common elements ($A \\cap B = \\emptyset$).",
            markingSchemeSteps: [{ stepDescription: "Condition A ∩ B = ∅", marks: 1 }],
          },
          {
            id: "q-ble-2",
            questionNumber: 2,
            group: "GROUP_A",
            marks: 1,
            cognitiveLevel: "Knowledge",
            learningOutcomeCode: "LO-MTH801-2.1",
            questionEnglish: "What is the formula to find Selling Price (SP) when Marked Price (MP) and Discount amount (D) are given?",
            questionNepali: "अंकित मूल्य (MP) र छुट रकम (D) दिएको बेला बिक्री मूल्य (SP) निकाल्ने सूत्र के हो?",
            options: [
              { id: "opt-1", text: "SP = MP - Discount", isCorrect: true },
              { id: "opt-2", text: "SP = MP + Discount", isCorrect: false },
              { id: "opt-3", text: "SP = MP × Discount", isCorrect: false },
              { id: "opt-4", text: "SP = MP / Discount", isCorrect: false },
            ],
            correctOptionId: "opt-1",
            modelAnswerMarkdown: "$$\\text{SP} = \\text{MP} - \\text{Discount}$$",
            markingSchemeSteps: [{ stepDescription: "Correct SP formula", marks: 1 }],
          },
          {
            id: "q-ble-3",
            questionNumber: 3,
            group: "GROUP_A",
            marks: 1,
            cognitiveLevel: "Knowledge",
            learningOutcomeCode: "LO-MTH801-4.1",
            questionEnglish: "In the quadratic polynomial $x^2 + 5x + 6$, find the product of roots $a \\cdot c$.",
            questionNepali: "वर्ग समीकरण $x^2 + ५x + ६$ मा गुणनफल $a \\cdot c$ को मान कति हुन्छ?",
            options: [
              { id: "opt-1", text: "6", isCorrect: true },
              { id: "opt-2", text: "5", isCorrect: false },
              { id: "opt-3", text: "1", isCorrect: false },
              { id: "opt-4", text: "11", isCorrect: false },
            ],
            correctOptionId: "opt-1",
            modelAnswerMarkdown: "$a \\cdot c = 1 \\times 6 = 6$",
            markingSchemeSteps: [{ stepDescription: "Calculation = 6", marks: 1 }],
          },
          {
            id: "q-ble-4",
            questionNumber: 4,
            group: "GROUP_A",
            marks: 1,
            cognitiveLevel: "Knowledge",
            learningOutcomeCode: "LO-MTH801-1.1",
            questionEnglish: "If $n(U) = 40$ and $n(A \\cup B) = 32$, find $n(A \\cup B)'$.",
            questionNepali: "यदि $n(U) = ४०$ र $n(A \\cup B) = ३२$ भए, $n(A \\cup B)'$ को मान कति हुन्छ?",
            options: [
              { id: "opt-1", text: "8", isCorrect: true },
              { id: "opt-2", text: "72", isCorrect: false },
              { id: "opt-3", text: "4", isCorrect: false },
              { id: "opt-4", text: "12", isCorrect: false },
            ],
            correctOptionId: "opt-1",
            modelAnswerMarkdown: "$n(A \\cup B)' = 40 - 32 = 8$",
            markingSchemeSteps: [{ stepDescription: "Value = 8", marks: 1 }],
          },
        ],
      },
      {
        group: "GROUP_B",
        groupTitle: "Group B (Short Questions - 2 × 2 = 4 Marks)",
        groupTitleNepali: "समूह 'ख' (७ × २ = १४ अंक)",
        marksPerQuestion: 2,
        questionCount: 2,
        totalGroupMarks: 4,
        questions: [
          {
            id: "q-ble-5",
            questionNumber: 5,
            group: "GROUP_B",
            marks: 2,
            cognitiveLevel: "Understanding",
            learningOutcomeCode: "LO-MTH801-1.1",
            questionEnglish: "If $n(A) = 40$, $n(B) = 30$, and $n(A \\cap B) = 15$, find $n(A \\cup B)$.",
            questionNepali: "यदि $n(A) = ४०$, $n(B) = ३०$, र $n(A \\cap B) = १५$ भए, $n(A \\cup B)$ को मान निकाल्नुहोस्।",
            options: [
              { id: "opt-1", text: "55", isCorrect: true },
              { id: "opt-2", text: "70", isCorrect: false },
              { id: "opt-3", text: "45", isCorrect: false },
              { id: "opt-4", text: "60", isCorrect: false },
            ],
            correctOptionId: "opt-1",
            modelAnswerMarkdown: "$n(A \\cup B) = 40 + 30 - 15 = 55$",
            markingSchemeSteps: [{ stepDescription: "Formula and calculation = 55", marks: 2 }],
          },
          {
            id: "q-ble-6",
            questionNumber: 6,
            group: "GROUP_B",
            marks: 2,
            cognitiveLevel: "Understanding",
            learningOutcomeCode: "LO-MTH801-2.2",
            questionEnglish: "Find the 13% VAT amount on a smartwatch priced at Rs. 4,000 after discount.",
            questionNepali: "छुट पछिको रु. ४,००० मूल्य पर्ने स्मार्टवाचमा लाग्ने १३% भ्याट रकम पत्ता लगाउनुहोस्।",
            options: [
              { id: "opt-1", text: "Rs. 520.00", isCorrect: true },
              { id: "opt-2", text: "Rs. 480.00", isCorrect: false },
              { id: "opt-3", text: "Rs. 550.00", isCorrect: false },
              { id: "opt-4", text: "Rs. 400.00", isCorrect: false },
            ],
            correctOptionId: "opt-1",
            modelAnswerMarkdown: "$\\text{VAT} = 4000 \\times 0.13 = \\text{Rs. } 520$",
            markingSchemeSteps: [{ stepDescription: "VAT Amount = Rs. 520", marks: 2 }],
          },
        ],
      },
      {
        group: "GROUP_C",
        groupTitle: "Group C (Long Questions - 1 × 4 = 4 Marks)",
        groupTitleNepali: "समूह 'ग' (६ × ४ = २४ अंक)",
        marksPerQuestion: 4,
        questionCount: 1,
        totalGroupMarks: 4,
        questions: [
          {
            id: "q-ble-7",
            questionNumber: 7,
            group: "GROUP_C",
            marks: 4,
            cognitiveLevel: "Application",
            learningOutcomeCode: "LO-MTH801-1.2",
            questionEnglish: "In an exam of 70 students, 45 passed in Math, 40 passed in Science, and 5 failed in both. How many passed in both subjects?",
            questionNepali: "७० जना विद्यार्थीहरूको परीक्षामा ४५ जना गणितमा, ४० जना विज्ञानमा उत्तीर्ण भए र ५ जना दुवैमा अनुत्तीर्ण भए। दुवै विषयमा उत्तीर्ण विद्यार्थी संख्या कति होला?",
            options: [
              { id: "opt-1", text: "20 students", isCorrect: true },
              { id: "opt-2", text: "15 students", isCorrect: false },
              { id: "opt-3", text: "25 students", isCorrect: false },
              { id: "opt-4", text: "18 students", isCorrect: false },
            ],
            correctOptionId: "opt-1",
            modelAnswerMarkdown: `1. $n(U) = 70, n(M \\cup S)' = 5 \\implies n(M \\cup S) = 70 - 5 = 65$.
2. $n(M \\cap S) = n(M) + n(S) - n(M \\cup S) = 45 + 40 - 65 = \\mathbf{20 \\text{ students}}$.`,
            markingSchemeSteps: [
              { stepDescription: "Finding union = 65", marks: 2 },
              { stepDescription: "Finding intersection = 20", marks: 2 },
            ],
          },
        ],
      },
      {
        group: "GROUP_D",
        groupTitle: "Group D (Higher Ability Questions - 1 × 4 = 4 Marks)",
        groupTitleNepali: "समूह 'घ' (२ × ४ = ८ अंक)",
        marksPerQuestion: 4,
        questionCount: 1,
        totalGroupMarks: 4,
        questions: [
          {
            id: "q-ble-8",
            questionNumber: 8,
            group: "GROUP_D",
            marks: 4,
            cognitiveLevel: "Higher Ability",
            learningOutcomeCode: "LO-MTH801-2.2",
            questionEnglish: "A shopkeeper bought a mobile for Rs. 15,000. He marked the price 20% above cost price and sold it with a 10% discount and 13% VAT. Calculate his overall profit or loss amount.",
            questionNepali: "एक पसलेले रु. १५,००० मा मोबाइल किनेर क्रयमूल्यभन्दा २०% बढाएर अंकित मूल्य राख्यो। उसले १०% छुट दिएर १३% भ्याट जोडी बिक्री गर्दा उसलाई कति नाफा वा नोक्सान भयो?",
            options: [
              { id: "opt-1", text: "Profit of Rs. 1,200.00", isCorrect: true },
              { id: "opt-2", text: "Profit of Rs. 1,500.00", isCorrect: false },
              { id: "opt-3", text: "Loss of Rs. 300.00", isCorrect: false },
              { id: "opt-4", text: "Profit of Rs. 1,800.00", isCorrect: false },
            ],
            correctOptionId: "opt-1",
            modelAnswerMarkdown: `1. $\\text{CP} = \\text{Rs. } 15000$.
2. $\\text{MP} = 15000 + 20\\% = \\text{Rs. } 18000$.
3. $\\text{SP without VAT} = 18000 - 10\\% = \\text{Rs. } 16200$.
4. Note: VAT goes to the Government of Nepal, so Profit is based on SP without VAT:
$$\\text{Profit} = \\text{SP} - \\text{CP} = 16200 - 15000 = \\mathbf{\\text{Rs. } 1,200.00}$$`,
            markingSchemeSteps: [
              { stepDescription: "Finding MP = Rs. 18,000", marks: 1.5 },
              { stepDescription: "Finding SP = Rs. 16,200", marks: 1.5 },
              { stepDescription: "Profit calculation = Rs. 1,200", marks: 1.0 },
            ],
          },
        ],
      },
    ],
  };
}
