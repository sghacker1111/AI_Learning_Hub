import { NextRequest, NextResponse } from "next/server";
import { MOCK_CHILDREN_PROFILES } from "@/lib/parent/child-data";
import { generateWhatsAppDigest, generateSMSDigest } from "@/lib/parent/notifications";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId") || "child-aarav";
    const child = MOCK_CHILDREN_PROFILES.find((c) => c.id === childId) || MOCK_CHILDREN_PROFILES[0];

    const whatsapp = generateWhatsAppDigest(child);
    const sms = generateSMSDigest(child);

    return NextResponse.json({ success: true, preview: true, sent: false, whatsapp, sms });
  } catch (error) {
    console.error("Parent digest API error:", error);
    return NextResponse.json({ error: "Failed to generate notification digest" }, { status: 500 });
  }
}
