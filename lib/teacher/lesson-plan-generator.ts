import { LessonPlan } from "./types";

export function generateCDCLessonPlan(
  subject: string = "Compulsory Mathematics",
  chapter: string = "13% VAT",
  durationMinutes: number = 45
): LessonPlan {
  const isVAT = chapter.toLowerCase().includes("vat") || chapter.toLowerCase().includes("arithmetic");
  const isScience = subject.toLowerCase().includes("science") || chapter.toLowerCase().includes("pressure") || chapter.toLowerCase().includes("archimedes");

  // 1. CLASS 8 MATHEMATICS: 13% VAT & DISCOUNT
  if (isVAT) {
    return {
      id: `lp-vat-${Date.now()}`,
      grade: "Class 8",
      subject: "Compulsory Mathematics",
      unit: "Unit 2: Arithmetic (अंकगणित)",
      chapter: "Discount and 13% VAT (छुट र मूल्य अभिवृद्धि कर)",
      periodNumber: 4,
      durationMinutes,
      curriculumEdition: "DEMO_CLASS8_TEMPLATE",
      specificObjectives: [
        "Define Marked Price (MP), Discount, and Value Added Tax (VAT) in commercial transactions.",
        "Calculate the discount amount and Selling Price (SP) after discount.",
        "Apply the 13% standard Nepal VAT rate on Selling Price and calculate the final amount paid.",
      ],
      specificObjectivesNepali: [
        "व्यापारिक कारोबारमा अंकित मूल्य, छुट र मूल्य अभिवृद्धि कर (VAT) लाई परिभाषित गर्न।",
        "अंकित मूल्यमा दिइएको छुट रकम र छुट पछिको बिक्री मूल्य (SP) निकाल्न।",
        "छुट पछिको बिक्री मूल्यमा नेपाल सरकारको १३% भ्याट जोडेर ग्राहकले तिर्नुपर्ने अन्तिम मूल्य गणना गर्न।",
      ],
      instructionalMaterials: [
        "Real Nepal market store purchase bills showing PAN/VAT breakdown.",
        "Price tag cutouts on dummy item boxes (books, school bags, stationery).",
        "Chart paper summarizing formula relations: SP = MP - Discount, Final SP = SP + 13% VAT.",
      ],
      instructionalMaterialsNepali: [
        "प्यान/भ्याट बिलका वास्तविक नमुनाहरू।",
        "अंकित मूल्य लेखिएका सामानका बट्टाहरू।",
        "सुत्रहरूको तालिका भएको चार्ट पेपर।",
      ],
      phases: [
        {
          phaseNumber: 1,
          title: "Phase 1: Motivation & Prior Knowledge Activation",
          titleNepali: "चरण १: उत्प्रेरणा र पूर्वज्ञान परीक्षण",
          durationMinutes: 5,
          teacherActivity: "Show a real store receipt of Rs. 1500 and ask students why an extra 13% was added at the bottom.",
          studentActivity: "Observe the store receipt, identify terms like Subtotal, VAT (13%), and Grand Total.",
          teachingMethod: "Interactive Questioning & Real-World Case Induction",
        },
        {
          phaseNumber: 2,
          title: "Phase 2: Concept Presentation & Demonstration",
          titleNepali: "चरण २: विषयवस्तु प्रस्तुतीकरण र प्रदर्शन",
          durationMinutes: 15,
          teacherActivity: "Derive on the whiteboard step-by-step: 1. Discount = MP × (D%/100), 2. SP = MP - Discount, 3. VAT = SP × 0.13, 4. Total = SP + VAT.",
          studentActivity: "Note formulas in notebooks, follow along with a worked example of a Rs. 2,000 bag with 10% discount.",
          teachingMethod: "Direct Instruction with Worked Example Modeling",
          latexFormulas: [
            "\\text{Discount} = \\text{MP} \\times \\frac{\\text{Discount}\\%}{100}",
            "\\text{SP} = \\text{MP} - \\text{Discount}",
            "\\text{VAT Amount} = \\text{SP} \\times 0.13",
            "\\text{Final SP with VAT} = \\text{SP} + \\text{VAT Amount}",
          ],
        },
        {
          phaseNumber: 3,
          title: "Phase 3: Group Practice & Cooperative Learning",
          titleNepali: "चरण ३: समूह कार्य र अभ्यास",
          durationMinutes: 15,
          teacherActivity: "Divide class into 4-member groups. Distribute mock commercial scenario cards (e.g. Mobile phone MP Rs. 12,000, 15% discount, 13% VAT). Circulate and assist struggling groups.",
          studentActivity: "Collaborate in groups to compute Discount, SP, and VAT amount, then cross-verify results on chart papers.",
          teachingMethod: "Peer Collaboration & Problem-Solving Activity",
        },
        {
          phaseNumber: 4,
          title: "Phase 4: Evaluation & Formative Assessment",
          titleNepali: "चरण ४: मूल्याङ्कन र पृष्ठपोषण",
          durationMinutes: 7,
          teacherActivity: "Write a quick check problem on board: 'If MP = Rs. 1000 and Discount = 20%, find the 13% VAT amount'. Ask 2 students from different groups to present solutions.",
          studentActivity: "Independently solve the quick problem in notebooks (SP = 800, VAT = Rs. 104).",
          teachingMethod: "Formative Whiteboard Checks",
        },
        {
          phaseNumber: 5,
          title: "Phase 5: Homework & Community Extension Activity",
          titleNepali: "चरण ५: गृहकार्य र परियोजना कार्य",
          durationMinutes: 3,
          teacherActivity: "Assign CDC Textbook Exercise 2.2 (Questions 1 to 4). Ask students to collect one real store bill from home for tomorrow's class.",
          studentActivity: "Note assigned exercises in homework diary.",
          teachingMethod: "Independent Extension & Home Connection",
        },
      ],
      formativeEvaluationQuestions: [
        "A jacket marked at Rs. 3,000 is sold with a 10% discount and 13% VAT. What is the final selling price?",
        "Why is VAT calculated on the selling price (SP) rather than the marked price (MP)?",
      ],
      homeworkTasks: [
        "Nepal CDC Class 8 Mathematics Textbook: Exercise 2.2, Problems #1, #3, #5 (p. 31).",
        "Project: Bring one grocery store invoice from home and verify whether 13% VAT was computed correctly.",
      ],
      teacherReflectionNotes: "Ensure students do not calculate 13% VAT directly on the Marked Price before deducting the discount.",
    };
  }

  // 2. CLASS 8 SCIENCE: ARCHIMEDES UPTHRUST
  if (isScience) {
    return {
      id: `lp-sci-${Date.now()}`,
      grade: "Class 8",
      subject: "Science & Technology",
      unit: "Unit 2: Force & Pressure (बल र चाप)",
      chapter: "Archimedes' Principle & Upthrust (आर्किमिडिजको सिद्धान्त र उर्ध्वचाप)",
      periodNumber: 3,
      durationMinutes,
      curriculumEdition: "DEMO_CLASS8_TEMPLATE",
      specificObjectives: [
        "State Archimedes' Principle and define buoyant upthrust (U).",
        "Demonstrate the relationship between upthrust and displaced liquid volume using a Eureka can.",
        "Solve numerical problems using U = V · d · g and calculate apparent weight.",
      ],
      specificObjectivesNepali: [
        "आर्किमिडिजको सिद्धान्त बताउन र उर्ध्वचापलाई परिभाषित गर्न।",
        "युरेका क्यानको प्रयोग गरी उर्ध्वचाप र विस्थापित तरलको तौल बराबर हुन्छ भनी प्रमाणित गर्न।",
        "U = V · d · g सुत्र प्रयोग गरी गणितीय समस्या हल गर्न।",
      ],
      instructionalMaterials: [
        "Spring balance and hanging metal cylinder.",
        "Eureka can / overflow vessel with measuring cylinder and water.",
        "Table of liquid densities (Pure water: 1000 kg/m³, Salty water: 1025 kg/m³).",
      ],
      instructionalMaterialsNepali: [
        "कमानी तराजु र धातुको डल्लो।",
        "युरेका क्यान र नाप्ने सिलिन्डर।",
        "विभिन्न तरल पदार्थहरूको घनत्व तालिका।",
      ],
      phases: [
        {
          phaseNumber: 1,
          title: "Phase 1: Motivation & Engagement",
          titleNepali: "चरण १: उत्प्रेरणा",
          durationMinutes: 5,
          teacherActivity: "Ask students: 'Why does a heavy stone feel lighter when immersed inside a bucket of water?'",
          studentActivity: "Share personal swimming or water lifting experiences.",
          teachingMethod: "Inquiry-Based Questioning",
        },
        {
          phaseNumber: 2,
          title: "Phase 2: Demonstration & Principle Derivation",
          titleNepali: "चरण २: प्रयोगात्मक प्रदर्शन र सुत्र स्थापना",
          durationMinutes: 15,
          teacherActivity: "Demonstrate weight of stone in air (5 N) vs water (3 N). Collect displaced water in measuring cylinder (2 N weight). Prove Upthrust = 2 N = Loss of weight.",
          studentActivity: "Record readings in observation table: W_air, W_water, Loss in weight.",
          teachingMethod: "Live Laboratory Demonstration",
          latexFormulas: [
            "U = V \\cdot d \\cdot g",
            "\\text{Apparent Weight} = W_{\\text{air}} - U",
            "\\text{Loss in Weight} = \\text{Weight of Displaced Fluid}",
          ],
        },
        {
          phaseNumber: 3,
          title: "Phase 3: Guided Numerical Practice",
          titleNepali: "चरण ३: गणितीय समस्या समाधान",
          durationMinutes: 15,
          teacherActivity: "Guide students to solve: An object displaces 0.002 m³ of water (d=1000 kg/m³, g=9.8 m/s²). Find upthrust.",
          studentActivity: "Substitute in U = V·d·g = 0.002 × 1000 × 9.8 = 19.6 N.",
          teachingMethod: "Guided Problem Solving",
        },
        {
          phaseNumber: 4,
          title: "Phase 4: Evaluation",
          titleNepali: "चरण ४: मूल्याङ्कन",
          durationMinutes: 7,
          teacherActivity: "Ask 3 oral comprehension questions on factors affecting upthrust (Liquid density and displaced volume).",
          studentActivity: "Respond individually.",
          teachingMethod: "Oral Quiz Check",
        },
        {
          phaseNumber: 5,
          title: "Phase 5: Homework",
          titleNepali: "चरण ५: गृहकार्य",
          durationMinutes: 3,
          teacherActivity: "Assign CDC Science Unit 2 Exercise #3, #4 (p. 25).",
          studentActivity: "Note homework in diary.",
          teachingMethod: "Independent Study",
        },
      ],
      formativeEvaluationQuestions: [
        "State Archimedes' Principle in your own words.",
        "If an object of volume 0.001 m³ is dipped in kerosene (density = 800 kg/m³), calculate the upthrust.",
      ],
      homeworkTasks: [
        "CDC Science Textbook: Unit 2 Exercise numerical problems #3 and #5.",
        "Draw a neat labelled diagram of a Eureka can experiment proving Archimedes' Principle.",
      ],
      teacherReflectionNotes: "Emphasize that upthrust depends on liquid density, not on the mass of the immersed object.",
    };
  }

  // 3. CLASS 8 MATHEMATICS: SETS CARDINALITY
  return {
    id: `lp-sets-${Date.now()}`,
    grade: "Class 8",
    subject: "Compulsory Mathematics",
    unit: "Unit 1: Sets (समूह)",
    chapter: "Cardinality of Overlapping Sets (दुई खप्टिएका समूहहरूको गणना संख्या)",
    periodNumber: 2,
    durationMinutes,
    curriculumEdition: "DEMO_CLASS8_TEMPLATE",
    specificObjectives: [
      "Distinguish between disjoint sets and overlapping sets.",
      "Apply the cardinality formula n(A ∪ B) = n(A) + n(B) - n(A ∩ B).",
      "Represent survey word problems on a 2-set Venn diagram.",
    ],
    specificObjectivesNepali: [
      "अलगिएका र खप्टिएका समूहहरू बीचको भिन्नता छुट्याउन।",
      "n(A ∪ B) = n(A) + n(B) - n(A ∩ B) सूत्र प्रयोग गरी गणना गर्न।",
      "सर्वेक्षण सम्बन्धी शाब्दिक समस्याहरूलाई २-समूहको भेनचित्रमा प्रस्तुत गर्न।",
    ],
    instructionalMaterials: [
      "Two overlapping circular rings cut out from colored cardboard.",
      "Venn diagram templates for group handouts.",
    ],
    instructionalMaterialsNepali: [
      "रंगीन कार्डबोर्डबाट काटिएका दुई खप्टिएका वृत्ताकार रिङहरू।",
      "भेनचित्र अभ्यास पानाहरू।",
    ],
    phases: [
      {
        phaseNumber: 1,
        title: "Phase 1: Motivation & Set Recognition",
        titleNepali: "चरण १: उत्प्रेरणा",
        durationMinutes: 5,
        teacherActivity: "Ask students who play Football to raise hand, then Volleyball, then both. Show overlap.",
        studentActivity: "Count hands for each category and observe overlap.",
        teachingMethod: "Classroom Participation Game",
      },
      {
        phaseNumber: 2,
        title: "Phase 2: Concept Demonstration",
        titleNepali: "चरण २: सुत्र स्थापना",
        durationMinutes: 15,
        teacherActivity: "Draw Venn diagram on board. Prove why n(A ∩ B) is subtracted once to avoid double counting.",
        studentActivity: "Sketch Venn diagram in notebooks with shaded intersection region.",
        teachingMethod: "Visual Diagrammatic Modeling",
        latexFormulas: [
          "n(A \\cup B) = n(A) + n(B) - n(A \\cap B)",
          "n_o(A) = n(A) - n(A \\cap B)",
          "n(A \\cup B)' = n(U) - n(A \\cup B)",
        ],
      },
      {
        phaseNumber: 3,
        title: "Phase 3: Group Activity",
        titleNepali: "चरण ३: समूह अभ्यास",
        durationMinutes: 15,
        teacherActivity: "Provide 60-student survey card. Guide students to compute n(M ∪ S)' complement.",
        studentActivity: "Work in pairs to fill Venn diagram circles and calculate neither.",
        teachingMethod: "Pair Collaboration",
      },
      {
        phaseNumber: 4,
        title: "Phase 4: Evaluation",
        titleNepali: "चरण ४: मूल्याङ्कन",
        durationMinutes: 7,
        teacherActivity: "Give a 2-minute whiteboard check on calculating n_o(A).",
        studentActivity: "Solve independently on notebooks.",
        teachingMethod: "Formative Quick Check",
      },
      {
        phaseNumber: 5,
        title: "Phase 5: Homework",
        titleNepali: "चरण ५: गृहकार्य",
        durationMinutes: 3,
        teacherActivity: "Assign CDC Math Unit 1 Exercise 1.1 (#2 to #6).",
        studentActivity: "Note in diary.",
        teachingMethod: "Independent Practice",
      },
    ],
    formativeEvaluationQuestions: [
      "If n(A)=25, n(B)=20, and n(A ∩ B)=8, what is n(A ∪ B)?",
      "What does n_o(A) represent in a Venn diagram?",
    ],
    homeworkTasks: [
      "Nepal CDC Mathematics Class 8: Exercise 1.1, Problems #2, #4, #6 (p. 15).",
    ],
    teacherReflectionNotes: "Ensure students distinguish between n(A) [the entire circle] and n_o(A) [only set A without overlap].",
  };
}
