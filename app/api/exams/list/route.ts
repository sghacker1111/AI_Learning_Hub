import { NextResponse } from "next/server";

export async function GET() {
  const exams = [
    {
      id: "ble_class_8_math",
      title: "Class 8 BLE Practice Mini Paper — Compulsory Mathematics",
      titleNepali: "कक्षा ८ आधारभूत तह परीक्षा (BLE) छोटो अभ्यास — अनिवार्य गणित",
      examType: "BLE",
      grade: "Class 8",
      subject: "Compulsory Mathematics",
      fullMarks: 16,
      passMarks: 6,
      durationMinutes: 120,
      badge: "BLE-Style Practice",
      description: "A 16-mark practice sample covering Sets, Arithmetic, Algebra, and Science applications.",
    },
    {
      id: "unit_test_math_sets_vat",
      title: "Class 8 Mathematics: Unit Test 1 (Sets & 13% VAT)",
      titleNepali: "कक्षा ८ गणित: एकाइ परीक्षा १ (समूह र १३% भ्याट)",
      examType: "UNIT_TEST",
      grade: "Class 8",
      subject: "Compulsory Mathematics",
      fullMarks: 20,
      passMarks: 8,
      durationMinutes: 45,
      badge: "Quick Assessment",
      description: "20-mark periodic unit assessment covering fundamental sets cardinality and consumer arithmetic.",
    },
  ];

  return NextResponse.json({ success: true, demo: true, officialPapers: false, exams });
}
