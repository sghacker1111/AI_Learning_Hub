import { TeacherAssignment } from "./types";

export function getTeacherAssignments(): TeacherAssignment[] {
  return [
    {
      id: "asgn-01",
      title: "Homework 4: Discount & 13% VAT Word Problems",
      classSectionId: "class-8a",
      subject: "Compulsory Mathematics",
      chapter: "Discount & 13% VAT",
      totalPoints: 20,
      dueDate: "Tomorrow, 5:00 PM",
      submissionCount: 34,
      totalStudents: 38,
      status: "ACTIVE",
    },
    {
      id: "asgn-02",
      title: "Quiz 2: 2-Set Venn Diagram Survey Problems",
      classSectionId: "class-8a",
      subject: "Compulsory Mathematics",
      chapter: "Sets",
      totalPoints: 15,
      dueDate: "Completed",
      submissionCount: 38,
      totalStudents: 38,
      status: "COMPLETED",
    },
    {
      id: "asgn-03",
      title: "Science Lab Report: Archimedes Eureka Can Verification",
      classSectionId: "class-8b",
      subject: "Science & Technology",
      chapter: "Force & Pressure",
      totalPoints: 25,
      dueDate: "In 3 Days",
      submissionCount: 18,
      totalStudents: 36,
      status: "ACTIVE",
    },
  ];
}
