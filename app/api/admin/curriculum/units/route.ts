import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");

    try {
      const dbUnits = await prisma.unit.findMany({
        where: subjectId ? { subjectId } : undefined,
        include: {
          chapters: {
            include: {
              lessons: {
                include: {
                  learningOutcomes: true,
                },
              },
            },
            orderBy: { chapterNumber: "asc" },
          },
        },
        orderBy: { unitNumber: "asc" },
      });

      if (dbUnits && dbUnits.length > 0) {
        return NextResponse.json({ units: dbUnits });
      }
    } catch {
      // Fallback
    }

    // Default mock units for Math / Science
    const fallbackUnits = [
      {
        id: "unit-1",
        unitNumber: 1,
        title: "Sets",
        titleNepali: "समुह",
        description: "Cardinality of sets, universal set, Venn diagrams, union and intersection formulas.",
        chapters: [
          {
            id: "ch-1",
            chapterNumber: 1,
            title: "Overlapping Sets & Cardinality Formulas",
            titleNepali: "खप्टिएका समूहहरू र गणनात्मकता सूत्र",
            summary: "Understand overlapping sets and apply formula n(A ∪ B) = n(A) + n(B) - n(A ∩ B)",
            lessons: [
              {
                id: "les-1",
                lessonNumber: 1,
                title: "Cardinality of Two Overlapping Sets",
                titleNepali: "दुई खप्टिएका समूहहरूको गणनात्मकता",
                status: "PUBLISHED",
                learningOutcomes: [
                  { id: "lo-1", code: "LO-MTH801-1.1", description: "Solve practical verbal problems using cardinality formulas." },
                ],
              },
              {
                id: "les-2",
                lessonNumber: 2,
                title: "Venn Diagram Construction for Overlapping Sets",
                titleNepali: "खप्टिएका समूहको भेन्चित्र निर्माण",
                status: "PUBLISHED",
                learningOutcomes: [
                  { id: "lo-2", code: "LO-MTH801-1.2", description: "Construct two-set Venn diagrams with complement regions." },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "unit-2",
        unitNumber: 2,
        title: "Arithmetic",
        titleNepali: "अङ्कगणित",
        description: "Profit & Loss, Value Added Tax (VAT), Compound Interest basics.",
        chapters: [
          {
            id: "ch-2",
            chapterNumber: 2,
            title: "Profit, Loss & Value Added Tax (VAT)",
            titleNepali: "नाफा, नोक्सान र मूल्य अभिवृद्धि कर",
            summary: "Calculate marked price, discount, profit/loss percentage, and 13% VAT.",
            lessons: [
              {
                id: "les-3",
                lessonNumber: 1,
                title: "Calculation of Value Added Tax (VAT)",
                titleNepali: "मूल्य अभिवृद्धि कर (VAT) को गणना",
                status: "APPROVED",
                learningOutcomes: [
                  { id: "lo-3", code: "LO-MTH801-2.1", description: "Calculate price with and without 13% VAT." },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "unit-4",
        unitNumber: 4,
        title: "Algebra",
        titleNepali: "बीजगणित",
        description: "Polynomials, factorization of ax² + bx + c, algebraic fractions.",
        chapters: [
          {
            id: "ch-4",
            chapterNumber: 4,
            title: "Factorization of Polynomials",
            titleNepali: "बीजीय व्यञ्जकको खण्डीकरण",
            summary: "Factorize quadratic expressions using middle term splitting.",
            lessons: [
              {
                id: "les-4",
                lessonNumber: 1,
                title: "Factorization of Quadratic Trinomials (ax² + bx + c)",
                titleNepali: "द्विघातीय त्रिपदीय व्यञ्जकको खण्डीकरण",
                status: "UNDER_REVIEW",
                learningOutcomes: [
                  { id: "lo-4", code: "LO-MTH801-4.1", description: "Factorize quadratic trinomials by splitting middle term." },
                ],
              },
            ],
          },
        ],
      },
    ];

    return NextResponse.json({ units: fallbackUnits, demo: true, persisted: false });
  } catch (error) {
    console.error("Units API error:", error);
    return NextResponse.json({ error: "Failed to fetch units" }, { status: 500 });
  }
}
