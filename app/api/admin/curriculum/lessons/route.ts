import { NextRequest, NextResponse } from "next/server";
import { ContentStatus, ContentType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("id") || "les-1";

    let dbLesson = null;
    try {
      dbLesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          contents: {
            include: {
              formulas: true,
              workedExamples: true,
              sourceReferences: true,
            },
          },
          learningOutcomes: true,
          chapter: {
            include: {
              unit: {
                include: {
                  subject: {
                    include: {
                      grade: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } catch {
      // Fallback
    }

    if (dbLesson) {
      return NextResponse.json({ lesson: dbLesson });
    }

    // Default sample lesson for live editor preview
    const sampleLesson = {
      id: "les-1",
      lessonNumber: 1,
      title: "Cardinality of Two Overlapping Sets",
      titleNepali: "दुई खप्टिएका समूहहरूको गणनात्मकता",
      summary: "Understand overlapping sets and apply formula n(A ∪ B) = n(A) + n(B) - n(A ∩ B) to solve verbal problems.",
      status: ContentStatus.PUBLISHED,
      chapter: {
        title: "Overlapping Sets & Cardinality Formulas",
        unit: {
          title: "Sets",
          subject: {
            name: "Compulsory Mathematics",
            grade: {
              name: "Class 8",
            },
          },
        },
      },
      learningOutcomes: [
        {
          id: "lo-1",
          code: "LO-MTH801-1.1",
          description: "Solve practical verbal problems involving two overlapping sets using Venn diagrams and cardinality formulas.",
          descriptionNepali: "भेन्चित्र र गणनात्मकता सूत्रको प्रयोग गरी दुई खप्टिएका समूहसम्बन्धी व्यावहारिक समस्या हल गर्न।",
          cognitiveLevel: "APPLICATION",
        },
      ],
      contents: [
        {
          id: "cnt-1",
          type: ContentType.CONCEPT,
          title: "Fundamental Cardinality Theorem",
          bodyMarkdown: `
### What are Overlapping Sets?
Two sets $A$ and $B$ are overlapping if they share common elements:
$$A \\cap B \\neq \\emptyset$$

### The Cardinality Formula
$$n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$$

If $U$ represents the Universal Set:
$$n(U) = n(A \\cup B) + n(A \\cup B)'$$
          `,
          formulas: [
            {
              id: "form-1",
              name: "Union Cardinality Formula",
              latexExpression: "n(A \\cup B) = n(A) + n(B) - n(A \\cap B)",
              variablesExplanation: "n(A) = elements in A, n(B) = elements in B, n(A ∩ B) = elements in both",
            },
          ],
          workedExamples: [
            {
              id: "ex-1",
              problem: "In a group of 60 students, 35 like Nepali, 28 like English, and 12 like both. How many like neither?",
              solutionSteps: `
1. $n(N \\cup E) = n(N) + n(E) - n(N \\cap E) = 35 + 28 - 12 = 51$
2. $n(N \\cup E)' = n(U) - n(N \\cup E) = 60 - 51 = 9$
Answer: 9 students.
              `,
              explanation: "Subtract intersection once to avoid double counting.",
            },
          ],
          sourceReferences: [
            {
              id: "src-1",
              bookTitle: "CDC Grade 8 Compulsory Mathematics",
              editionYear: "2081 BS",
              pageNumber: "12-15",
              chapterName: "Unit 1: Sets",
            },
          ],
        },
      ],
    };

    return NextResponse.json({ lesson: sampleLesson, demo: true, persisted: false });
  } catch (error) {
    console.error("Lessons API error:", error);
    return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await request.json();
    return NextResponse.json({
      success: false,
      persisted: false,
      error: "Lesson persistence is not implemented.",
    }, { status: 501 });
  } catch (error) {
    console.error("Save lesson API error:", error);
    return NextResponse.json({ error: "Failed to save lesson" }, { status: 500 });
  }
}
