import { ClassSection, ClassroomAnalytics } from "./types";

export function getMockClassSections(): ClassSection[] {
  return [
    {
      id: "class-8a",
      grade: "Class 8",
      section: "Section A",
      subject: "Compulsory Mathematics",
      studentCount: 38,
      averageMastery: 78,
      activeAssignmentsCount: 2,
      roster: [
        {
          id: "std-01",
          rollNumber: 1,
          name: "Aarav Sharma",
          email: "aarav.sharma@school.edu.np",
          masteryPercentage: 94,
          streakDays: 12,
          hasPrerequisiteGap: false,
          lastActive: "Today",
        },
        {
          id: "std-02",
          rollNumber: 2,
          name: "Bishal Thapa",
          email: "bishal.thapa@school.edu.np",
          masteryPercentage: 54,
          streakDays: 1,
          hasPrerequisiteGap: true,
          gapTopic: "Basic Percentages (LO-MTH800-0.1)",
          lastActive: "Yesterday",
        },
        {
          id: "std-03",
          rollNumber: 3,
          name: "Divya Adhikari",
          email: "divya.adhikari@school.edu.np",
          masteryPercentage: 88,
          streakDays: 8,
          hasPrerequisiteGap: false,
          lastActive: "Today",
        },
        {
          id: "std-04",
          rollNumber: 4,
          name: "Kiran Poudel",
          email: "kiran.poudel@school.edu.np",
          masteryPercentage: 48,
          streakDays: 0,
          hasPrerequisiteGap: true,
          gapTopic: "Fractions & Ratios",
          lastActive: "3 days ago",
        },
      ],
    },
    {
      id: "class-8b",
      grade: "Class 8",
      section: "Section B",
      subject: "Science & Technology",
      studentCount: 36,
      averageMastery: 74,
      activeAssignmentsCount: 1,
      roster: [],
    },
  ];
}

export function getClassroomAnalytics(classId: string = "class-8a"): ClassroomAnalytics {
  return {
    classId,
    className: "Class 8 Section A — Compulsory Mathematics",
    averageMastery: 78,
    highPerformersCount: 12,
    onTrackCount: 20,
    needsSupportCount: 6,
    conceptHeatmap: [
      { chapter: "Unit 1: Sets Cardinality", masteryScore: 88, difficultyLevel: "Easy" },
      { chapter: "Unit 2: Discount & 13% VAT", masteryScore: 82, difficultyLevel: "Medium" },
      { chapter: "Unit 4: Quadratic Factorization", masteryScore: 72, difficultyLevel: "Medium" },
      { chapter: "Unit 1: 3-Set Survey Problems", masteryScore: 58, difficultyLevel: "Challenging" },
    ],
    atRiskStudents: [
      {
        studentName: "Bishal Thapa",
        rollNumber: 2,
        strugglingConcept: "13% Value Added Tax",
        prerequisiteGap: "Basic Percentages & Fractions",
        masteryScore: 54,
      },
      {
        studentName: "Kiran Poudel",
        rollNumber: 4,
        strugglingConcept: "Sets Survey Complement",
        prerequisiteGap: "Set Notation & Union",
        masteryScore: 48,
      },
    ],
  };
}
