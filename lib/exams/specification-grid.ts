import { ExamType, QuestionGroup } from "./types";

export interface SpecificationGroupRule {
  group: QuestionGroup;
  title: string;
  titleNepali: string;
  marksPerQuestion: number;
  questionCount: number;
  totalMarks: number;
}

export interface ExamSpecificationGrid {
  examType: ExamType;
  grade: string;
  subject: string;
  fullMarks: number;
  passMarks: number;
  durationMinutes: number;
  groups: SpecificationGroupRule[];
}

export const CDC_SPECIFICATION_GRIDS: Record<string, ExamSpecificationGrid> = {
  ble_class_8_math: {
    examType: "BLE",
    grade: "Class 8",
    subject: "Compulsory Mathematics",
    fullMarks: 50,
    passMarks: 18,
    durationMinutes: 120, // 2 Hours
    groups: [
      {
        group: "GROUP_A",
        title: "Group A (Very Short Questions)",
        titleNepali: "समूह 'क' (अति संक्षिप्त उत्तरावली)",
        marksPerQuestion: 1,
        questionCount: 4,
        totalMarks: 4,
      },
      {
        group: "GROUP_B",
        title: "Group B (Short Questions)",
        titleNepali: "समूह 'ख' (संक्षिप्त उत्तरावली)",
        marksPerQuestion: 2,
        questionCount: 7,
        totalMarks: 14,
      },
      {
        group: "GROUP_C",
        title: "Group C (Long Questions)",
        titleNepali: "समूह 'ग' (लामो उत्तरावली)",
        marksPerQuestion: 4,
        questionCount: 6,
        totalMarks: 24,
      },
      {
        group: "GROUP_D",
        title: "Group D (Higher Ability / Problem Solving)",
        titleNepali: "समूह 'घ' (उच्च दक्षता / समस्या समाधान)",
        marksPerQuestion: 4,
        questionCount: 2,
        totalMarks: 8,
      },
    ],
  },
  see_class_10_math: {
    examType: "SEE",
    grade: "Class 10",
    subject: "Compulsory Mathematics",
    fullMarks: 75,
    passMarks: 27,
    durationMinutes: 180, // 3 Hours
    groups: [
      {
        group: "GROUP_A",
        title: "Group A (Very Short Questions)",
        titleNepali: "समूह 'क' (अति संक्षिप्त प्रश्नहरू)",
        marksPerQuestion: 1,
        questionCount: 6,
        totalMarks: 6,
      },
      {
        group: "GROUP_B",
        title: "Group B (Short Questions)",
        titleNepali: "समूह 'ख' (संक्षिप्त प्रश्नहरू)",
        marksPerQuestion: 2,
        questionCount: 10,
        totalMarks: 20,
      },
      {
        group: "GROUP_C",
        title: "Group C (Long Questions)",
        titleNepali: "समूह 'ग' (लामो प्रश्नहरू)",
        marksPerQuestion: 4,
        questionCount: 8,
        totalMarks: 32,
      },
      {
        group: "GROUP_D",
        title: "Group D (Higher Ability Questions)",
        titleNepali: "समूह 'घ' (उच्च दक्षता प्रश्नहरू)",
        marksPerQuestion: 5,
        questionCount: 3,
        totalMarks: 17, // Adjusted to 75 total
      },
    ],
  },
  unit_test_math_sets_vat: {
    examType: "UNIT_TEST",
    grade: "Class 8",
    subject: "Compulsory Mathematics",
    fullMarks: 20,
    passMarks: 8,
    durationMinutes: 45,
    groups: [
      {
        group: "GROUP_A",
        title: "Group A (Objective / Knowledge)",
        titleNepali: "समूह 'क' (ज्ञानात्मक प्रश्नहरू)",
        marksPerQuestion: 1,
        questionCount: 2,
        totalMarks: 2,
      },
      {
        group: "GROUP_B",
        title: "Group B (Short Calculations)",
        titleNepali: "समूह 'ख' (संक्षिप्त हिसाब)",
        marksPerQuestion: 2,
        questionCount: 3,
        totalMarks: 6,
      },
      {
        group: "GROUP_C",
        title: "Group C (Application Word Problems)",
        titleNepali: "समूह 'ग' (प्रयोगात्मक समस्या)",
        marksPerQuestion: 4,
        questionCount: 3,
        totalMarks: 12,
      },
    ],
  },
};
