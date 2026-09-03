import { CurriculumChunk } from "./types";

export const CDC_CURRICULUM_KNOWLEDGE_BASE: CurriculumChunk[] = [
  {
    id: "chunk-mth801-sets-cardinality-2",
    content: `In Nepal CDC Class 8 Mathematics, Unit 1: Sets deals with the cardinality of sets. 
For any two overlapping subsets A and B of a universal set U:
1. Elements belonging only to set A: n_o(A) = n(A) - n(A ∩ B)
2. Elements belonging only to set B: n_o(B) = n(B) - n(A ∩ B)
3. Cardinality of union of two overlapping sets:
$$n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$$
Alternatively, in terms of disjoint regions:
$$n(A \\cup B) = n_o(A) + n_o(B) + n(A \\cap B)$$
4. Complement of union (elements belonging to neither set):
$$n(A \\cup B)' = n(U) - n(A \\cup B)$$`,
    contentNepali: `कक्षा ८ अनिवार्य गणित, एकाइ १: समूह। दुई खप्टिएका समूहहरू A र B को लागि:
१. समूह A मा मात्र पर्ने सदस्य संख्या: n_o(A) = n(A) - n(A ∩ B)
२. दुई समूहको संयोजनको गणना संख्या: n(A ∪ B) = n(A) + n(B) - n(A ∩ B)
३. दुवै समूहमा नपर्ने सदस्य संख्या (पूरक): n(A ∪ B)' = n(U) - n(A ∪ B)`,
    latexFormulas: [
      "n(A \\cup B) = n(A) + n(B) - n(A \\cap B)",
      "n_o(A) = n(A) - n(A \\cap B)",
      "n(A \\cup B)' = n(U) - n(A \\cup B)",
    ],
    metadata: {
      grade: "Class 8",
      gradeCode: "class-8",
      subject: "Compulsory Mathematics",
      subjectCode: "MTH-801",
      unit: "Unit 1: Sets",
      chapter: "Cardinality of Sets",
      learningOutcomeCode: "LO-MTH801-1.1",
      pageRange: "12-15",
      curriculumEdition: "DEMO_CLASS8_SAMPLE",
      sectionTitle: "Cardinality Relations of Two Overlapping Sets",
    },
    keywords: ["sets", "cardinality", "union", "intersection", "overlapping", "complement", "समुह", "खप्टिएका", "संयोजन", "प्रतिच्छेदन"],
  },
  {
    id: "chunk-mth801-arithmetic-vat",
    content: `In Nepal CDC Class 8 Mathematics, Unit 2: Arithmetic covers commercial transactions and taxation according to the Value Added Tax Act of Nepal.
1. Marked Price (MP): The listed or printed price of goods.
2. Discount Amount: Reduction given on Marked Price.
$$\\text{Discount Amount} = \\text{MP} \\times \\frac{\\text{Discount}\\%}{100}$$
3. Selling Price without VAT (SP):
$$\\text{SP} = \\text{MP} - \\text{Discount Amount}$$
4. Value Added Tax (VAT): In Nepal, standard VAT is 13% applied strictly on SP (after discount).
$$\\text{VAT Amount} = \\text{SP} \\times \\frac{13}{100} = \\text{SP} \\times 0.13$$
5. Final Selling Price with VAT (SP with VAT):
$$\\text{Final SP} = \\text{SP} + \\text{VAT Amount} = \\text{SP} \\times 1.13$$`,
    contentNepali: `कक्षा ८ अनिवार्य गणित, एकाइ २: अंकगणित (छुट र मूल्य अभिवृद्धि कर)।
१. अंकित मूल्य (MP) मा छुट घटाएर बिक्री मूल्य (SP) निकालिन्छ।
२. नेपालमा मूल्य अभिवृद्धि कर (VAT) को दर १३% छ जुन छुट पछिको बिक्री मूल्यमा लगाइन्छ।
३. भ्याट सहितको बिक्री मूल्य = SP + VAT रकम।`,
    latexFormulas: [
      "\\text{Discount} = \\text{MP} \\times \\frac{\\text{Discount}\\%}{100}",
      "\\text{SP} = \\text{MP} - \\text{Discount}",
      "\\text{VAT Amount} = \\text{SP} \\times 0.13",
      "\\text{Final SP} = \\text{SP} + \\text{VAT}",
    ],
    metadata: {
      grade: "Class 8",
      gradeCode: "class-8",
      subject: "Compulsory Mathematics",
      subjectCode: "MTH-801",
      unit: "Unit 2: Arithmetic",
      chapter: "Discount & 13% VAT",
      learningOutcomeCode: "LO-MTH801-2.2",
      pageRange: "28-32",
      curriculumEdition: "DEMO_CLASS8_SAMPLE",
      sectionTitle: "Calculation of Discount and 13% VAT in Nepal",
    },
    keywords: ["vat", "discount", "marked price", "selling price", "13%", "tax", "अंकित मूल्य", "छुट", "मूल्य अभिवृद्धि कर"],
  },
  {
    id: "chunk-mth801-algebra-factorization",
    content: `In Nepal CDC Class 8 Mathematics, Unit 4: Algebra covers the factorization of quadratic trinomials of the standard form:
$$ax^2 + bx + c$$
Method of Splitting the Middle Term:
1. Find the product of the leading coefficient and constant term: $P = a \\times c$.
2. Find two integers $p$ and $q$ such that:
$$p \\times q = a \\times c \\quad \\text{and} \\quad p + q = b$$
3. Rewrite the middle term $bx$ as $px + qx$:
$$ax^2 + px + qx + c$$
4. Group terms in pairs and factor out common binomial expressions.`,
    contentNepali: `कक्षा ८ बीजगणित, एकाइ ४: खण्डीकरण। मध्य पद विभाजन विधिबाट ax² + bx + c को खण्डीकरण:
१. a र c को गुणनफल ac पत्ता लगाउने।
२. p × q = ac र p + q = b हुने दुई संख्याहरू p र q पत्ता लगाउने।
३. मध्य पद bx लाई px + qx मा विभाजन गरी समूह बनाई साझा पद झिक्ने।`,
    latexFormulas: [
      "ax^2 + bx + c",
      "p \\cdot q = a \\cdot c \\quad \\text{and} \\quad p + q = b",
      "ax^2 + px + qx + c",
    ],
    metadata: {
      grade: "Class 8",
      gradeCode: "class-8",
      subject: "Compulsory Mathematics",
      subjectCode: "MTH-801",
      unit: "Unit 4: Algebra",
      chapter: "Factorization of Polynomials",
      learningOutcomeCode: "LO-MTH801-4.1",
      pageRange: "65-68",
      curriculumEdition: "DEMO_CLASS8_SAMPLE",
      sectionTitle: "Quadratic Trinomial Factorization via Middle Term Splitting",
    },
    keywords: ["algebra", "factorization", "quadratic", "middle term", "खण्डीकरण", "बीजगणित"],
  },
  {
    id: "chunk-sci802-pressure-liquid",
    content: `In Nepal CDC Class 8 Science & Technology, Unit 2: Force & Pressure covers fluid mechanics and liquid pressure.
Liquid Pressure Formula:
$$P = h \\cdot d \\cdot g$$
Where:
- $P$ = Liquid pressure in Pascals ($Pa$ or $N/m^2$)
- $h$ = Depth of the liquid column in meters ($m$)
- $d$ = Density of the liquid in $kg/m^3$ (e.g. pure water: $1000\\text{ kg/m}^3$)
- $g$ = Acceleration due to gravity ($9.8\\text{ m/s}^2$ on Earth)

Key Properties of Liquid Pressure:
1. Increases directly with depth ($P \\propto h$).
2. Increases directly with liquid density ($P \\propto d$).
3. Liquid exerts equal pressure in all directions at the same depth (Pascal's law).`,
    contentNepali: `कक्षा ८ विज्ञान तथा प्रविधि, एकाइ २: चाप र तरल पदार्थ।
तरल पदार्थको चापको सुत्र: P = h · d · g
जहाँ:
- P = तरलको चाप (पास्कल, Pa)
- h = तरलको गहिराइ (मिटर)
- d = तरलको घनत्व (kg/m³)
- g = गुरुत्वप्रवेग (९.८ m/s²)`,
    latexFormulas: [
      "P = h \\cdot d \\cdot g",
      "P \\propto h \\quad \\text{and} \\quad P \\propto d",
    ],
    metadata: {
      grade: "Class 8",
      gradeCode: "class-8",
      subject: "Science & Technology",
      subjectCode: "SCI-802",
      unit: "Unit 2: Force & Pressure",
      chapter: "Liquid Pressure",
      learningOutcomeCode: "LO-SCI802-2.1",
      pageRange: "18-21",
      curriculumEdition: "DEMO_CLASS8_SAMPLE",
      sectionTitle: "Mathematical Derivation and Factors of Liquid Pressure",
    },
    keywords: ["pressure", "liquid pressure", "depth", "density", "pascal", "चाप", "तरलको चाप", "घनत्व", "गहिराइ"],
  },
  {
    id: "chunk-sci802-upthrust-archimedes",
    content: `In Nepal CDC Class 8 Science & Technology, Unit 2: Force & Pressure covers Archimedes' Principle and Buoyant Upthrust.
Archimedes' Principle:
When an object is wholly or partially immersed in a fluid, it experiences an upward force (Upthrust) equal to the weight of the fluid displaced by it.
Upthrust Formula:
$$U = V \\cdot d \\cdot g$$
Where:
- $U$ = Upthrust in Newtons ($N$)
- $V$ = Volume of displaced fluid in cubic meters ($m^3$)
- $d$ = Density of fluid in $kg/m^3$
- $g$ = Acceleration due to gravity ($9.8\\text{ m/s}^2$)

Apparent Weight of Submerged Object:
$$\\text{Apparent Weight in Fluid} = W_{\\text{air}} - U$$
Law of Flotation:
A body floats in a fluid if the upthrust acting on it equals its total weight in air ($U = W_{\\text{air}}$).
- Object sinks if: Density of object > Density of liquid ($d_{\\text{obj}} > d_{\\text{liq}}$)
- Object floats if: Density of object ≤ Density of liquid ($d_{\\text{obj}} \\le d_{\\text{liq}}$)`,
    contentNepali: `कक्षा ८ विज्ञान, एकाइ २: आर्किमिडिजको सिद्धान्त र उर्ध्वचाप।
उर्ध्वचापको सुत्र: U = V · d · g
आर्किमिडिजको सिद्धान्त अनुसार: कुनै वस्तुलाई तरलमा पूर्ण वा आंशिक रूपमा डुबाउँदा विस्थापित तरलको तौल बराबरको उर्ध्वचाप लाग्दछ।
तरलमा देखिने तौल = हावामा तौल - उर्ध्वचाप (Apparent Weight = W_air - U)।`,
    latexFormulas: [
      "U = V \\cdot d \\cdot g",
      "\\text{Apparent Weight} = W_{\\text{air}} - U",
      "U = W_{\\text{displaced liquid}}",
    ],
    metadata: {
      grade: "Class 8",
      gradeCode: "class-8",
      subject: "Science & Technology",
      subjectCode: "SCI-802",
      unit: "Unit 2: Force & Pressure",
      chapter: "Upthrust & Archimedes' Principle",
      learningOutcomeCode: "LO-SCI802-2.2",
      pageRange: "22-26",
      curriculumEdition: "DEMO_CLASS8_SAMPLE",
      sectionTitle: "Archimedes' Principle, Upthrust, and Law of Flotation",
    },
    keywords: ["upthrust", "archimedes", "buoyancy", "flotation", "apparent weight", "उर्ध्वचाप", "आर्किमिडिज", "प्लवन"],
  },
];
